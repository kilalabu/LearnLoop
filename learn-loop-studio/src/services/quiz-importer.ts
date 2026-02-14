import { generateText, Output } from 'ai';
import { ImportQuizResponseSchema, ImportQuizResponse } from '@/domain/quiz';
import { getModel } from '@/lib/ai/models';
import { QuizGenerator, type MaxQuestions } from './quiz-generator';

import { QUIZ_CATEGORIES } from '@/domain/quiz-constants';

/**
 * 取り込み専用のシステムプロンプト。
 * フィールドごとの変換ルールは ImportQuizSchema の describe() で定義済み。
 */
const SYSTEM_PROMPT = `あなたはクイズデータの構造化変換の専門家。

## パース指針
- 正解や解説が明示されている場合はそのまま採用して
- 問題の区切りが不明確な場合は、見出し（##, ###）やナンバリング（Q1, Q2 等）を手がかりにして

## カテゴリ選択
- 内容を分析し、以下のリストから最も適切なカテゴリを1つ選択して
- リスト: ${QUIZ_CATEGORIES.join(', ')}
`;

/**
 * 既存のマークダウン形式クイズを所定フォーマットに変換して取り込むサービス。
 */
export class QuizImporter {

  /**
   * マークダウン形式のクイズテキストを所定フォーマットに変換する。
   * @param text 取り込み対象のマークダウンテキスト
   * @param modelId 使用するAIモデルのID
   * @param maxQuestions 問題数制限（取り込みのデフォルトは 'unlimited'）
   */
  async importFromText(
    text: string,
    modelId?: string,
    maxQuestions?: MaxQuestions
  ): Promise<ImportQuizResponse> {
    // 入力テキストが長すぎる場合、トークン制限考慮で切り詰め
    const content = text.length > 20000 ? text.substring(0, 20000) : text;

    // 取り込みのデフォルトは制限なし
    const effectiveMaxQuestions = maxQuestions ?? 'unlimited';
    const maxQuestionsInstruction = QuizGenerator.buildMaxQuestionsInstruction(effectiveMaxQuestions);

    try {
      const result = await generateText({
        model: getModel(modelId),
        output: Output.object({ schema: ImportQuizResponseSchema }),
        system: SYSTEM_PROMPT,
        prompt: `以下のマークダウンに含まれるクイズを所定のフォーマットに変換してください：${maxQuestionsInstruction}\n${content}`,
      });

      return result.output as ImportQuizResponse;
    } catch (error) {
      console.error('AI Import Error:', error);
      throw new Error('Failed to import quiz from text.');
    }
  }
}
