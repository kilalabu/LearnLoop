// scripts/batch/providers/studio-provider.ts

import { v4 as uuidv4 } from 'uuid';
import { createServiceClient, getPlaceholderUserId } from '../../../src/lib/supabase/client';
import { QuizRepository } from '../../../src/repositories/quiz-repository';
import { ImportQuizResponseSchema } from '../../../src/domain/import-quiz-schema';
import { QuizGenerator } from '../../../src/services/quiz-generator';
import { BatchProvider, BatchRequestItem } from './base-provider';
import { StudioBatchRow } from '../../lib/batch-types';
import type { SaveQuizInput } from '../../../src/domain/quiz';

const IMPORT_SYSTEM_PROMPT = `あなたはクイズデータの構造化変換の専門家です。

## パース指針
- 原文の問題文、選択肢、解答、解説を極力そのまま抽出してください。
- 正解や解説が明示されている場合はそのまま採用してください。
- 問題の区切りが不明確な場合は、見出し（##, ###）やナンバリング（Q1, Q2 等）を手がかりにしてください。

## フィールド定義
- question: 問題文。原文の問題文をそのまま抽出すること。改変や要約は行わないこと。
- options: 選択肢のリスト（2個以上）。原文に含まれる選択肢をすべて抽出すること。個数の上限はない。記号（A), B) 等）は除去してテキスト部分のみとすること。
- answers: 正解の選択肢文字列のリスト。optionsに含まれる文字列と完全一致させること。
- explanation: 解説。原文の解説をそのまま保持すること。コードブロック、表、リスト、ネストされた詳細などのマークダウン記法はすべて維持すること。
- topic: 入力内容から抽出された主題。
`;

const OUTPUT_FORMAT_INSTRUCTION = `
### 出力形式
以下のJSON形式で出力してください:
{
  "topic": "主題",
  "quizzes": [
    {
      "question": "問題文",
      "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "answers": ["正解の選択肢テキスト"],
      "explanation": "解説"
    }
  ]
}
- options は原文にあるものをすべて含めること
- answers は options に含まれる文字列と完全一致させること
- quizzes は 1 問以上`;

export class StudioBatchProvider implements BatchProvider<StudioBatchRow> {
  readonly name = 'Studio(Supabase)';
  private supabase = createServiceClient();
  private userId = getPlaceholderUserId();
  private quizRepo = new QuizRepository(this.supabase, this.userId);

  /**
   * OpenAI への送信を待っているリクエストを取得する
   */
  async fetchPendingItems(): Promise<StudioBatchRow[]> {
    const { data, error } = await this.supabase
      .from('quiz_batch_requests')
      .select('*')
      .eq('status', 'pending');

    if (error) throw error;
    return data as StudioBatchRow[];
  }

  async createRequestItem(row: StudioBatchRow): Promise<BatchRequestItem> {
    const systemPrompt = IMPORT_SYSTEM_PROMPT
      + QuizGenerator.buildMaxQuestionsInstruction('unlimited')
      + OUTPUT_FORMAT_INSTRUCTION;

    return {
      custom_id: `studio_req_${row.id}`,
      body: {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `以下のマークダウンに含まれるクイズを所定のフォーマットに変換してください：\n\n${row.source_content}` },
        ],
        response_format: { type: 'json_object' },
      },
    };
  }

  async markAsProcessing(rows: StudioBatchRow[], batchId: string): Promise<void> {
    const ids = rows.map(r => r.id);
    const { error } = await this.supabase
      .from('quiz_batch_requests')
      .update({ status: 'processing', batch_id: batchId })
      .in('id', ids);

    if (error) throw error;
  }

  async fetchActiveBatchIds(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('quiz_batch_requests')
      .select('batch_id')
      .eq('status', 'processing')
      .not('batch_id', 'is', null);

    if (error) throw error;
    const batchIds = new Set(data.map(r => r.batch_id as string));
    return Array.from(batchIds);
  }

  async handleBatchCompletion(batchId: string, results: Map<string, any>): Promise<void> {
    // 1. このバッチに対応するレコードを取得
    const { data: rows, error: fetchError } = await this.supabase
      .from('quiz_batch_requests')
      .select('*')
      .eq('batch_id', batchId)
      .eq('status', 'processing');

    if (fetchError) throw fetchError;
    if (!rows || rows.length === 0) return;

    for (const row of rows) {
      try {
        const customId = `studio_req_${row.id}`;
        const result = results.get(customId);

        if (!result) throw new Error(`結果に custom_id=${customId} が見関つかりません`);
        if (result.error) throw new Error(`OpenAI エラー: ${result.error.message}`);

        const content = result.response.body.choices[0]?.message?.content;
        if (!content) throw new Error('レスポンスに content がありません');

        // OpenAI からの出力をオブジェクトとしてパースし、Zod Schema で検証
        // これにより、以降の処理で型安全にデータを扱える
        const parsed = JSON.parse(content);
        const validated = ImportQuizResponseSchema.parse(parsed);

        // 内部で扱う SaveQuizInput 形式に変換。
        // リポジトリ層を介することで、DB へのインサートロジックを一元化している
        const quizInputs: SaveQuizInput[] = validated.quizzes.map((quiz) => ({
          id: uuidv4(),
          question: quiz.question,
          options: quiz.options.map((optText) => ({
            id: uuidv4(),
            text: optText,
            isCorrect: quiz.answers.includes(optText),
          })),
          explanation: quiz.explanation,
          category: validated.topic || row.source_name,
          sourceType: 'import',
        }));

        // 保存
        await this.quizRepo.save(quizInputs);

        // ステータス更新
        await this.supabase
          .from('quiz_batch_requests')
          .update({ status: 'completed' })
          .eq('id', row.id);

        console.log(`[StudioProvider] Request ${row.id} completed: ${quizInputs.length} quizzes saved.`);

      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[StudioProvider] Request ${row.id} processing failed:`, message);
        await this.supabase
          .from('quiz_batch_requests')
          .update({ status: 'failed', error_message: message })
          .eq('id', row.id);
      }
    }
  }

  async handleBatchFailure(batchId: string, errorMessage: string): Promise<void> {
    await this.supabase
      .from('quiz_batch_requests')
      .update({ status: 'failed', error_message: errorMessage })
      .eq('batch_id', batchId);
  }
}
