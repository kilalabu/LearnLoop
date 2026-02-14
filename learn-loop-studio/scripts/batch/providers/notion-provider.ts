// scripts/batch/providers/notion-provider.ts

import { v4 as uuidv4 } from 'uuid';
import { NotionClient } from '../../lib/notion-client';
import { WebScraper } from '../../../src/services/web-scraper';
import { SYSTEM_PROMPT, QuizGenerator } from '../../../src/services/quiz-generator';
import { createServiceClient, getPlaceholderUserId } from '../../../src/lib/supabase/client';
import { QuizRepository } from '../../../src/repositories/quiz-repository';
import { GenerateQuizResponseSchema } from '../../../src/domain/generate-quiz-schema';
import { BatchProvider, BatchRequestItem } from './base-provider';
import { NotionSubmissionPage, MAX_CONTENT_LENGTH, BatchOutputLine } from '../../lib/batch-types';
import { SaveQuizInput } from '../../../src/domain/quiz';

/** クイズ生成リクエストの出力形式指示プロンプト */
const OUTPUT_FORMAT_INSTRUCTION = `
### 出力形式
以下のJSON形式で出力してください:
{
  "topic": "入力内容から抽出された主題",
  "category": "Mobile|Frontend|Backend|Infra|Data Storage|Architecture|CS|QA|AI|Soft Skills|Tooling|Security|Others のいずれか",
  "quizzes": [
    {
      "question": "問題文",
      "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
      "answers": ["正解の選択肢テキスト"],
      "explanation": "解説（Markdown形式）"
    }
  ]
}
- options は 2〜4 個
- answers は options に含まれる文字列と完全一致させること
- quizzes は 1 問以上`;

export class NotionBatchProvider implements BatchProvider<NotionSubmissionPage> {
  readonly name = 'Notion';
  private notion = new NotionClient();
  private scraper = new WebScraper();
  private supabase = createServiceClient();
  private userId = getPlaceholderUserId();
  private quizRepo = new QuizRepository(this.supabase, this.userId);

  async fetchPendingItems(): Promise<NotionSubmissionPage[]> {
    return await this.notion.fetchSubmissionPages(10);
  }

  async createRequestItem(page: NotionSubmissionPage): Promise<BatchRequestItem> {
    let content = await this.notion.getPageContent(page.pageId);

    if (content.trim().length < 50 && page.sourceUrl) {
      console.log(`[NotionProvider] Page ${page.pageId}: 本文が短いため URL からスクレイピング: ${page.sourceUrl}`);
      content = await this.scraper.scrapeUrl(page.sourceUrl);
    }

    if (content.trim().length < 50) {
      throw new Error('テキストコンテンツが不十分です（本文もURLも取得できません）');
    }

    const trimmed = content.length > MAX_CONTENT_LENGTH
      ? content.substring(0, MAX_CONTENT_LENGTH)
      : content;

    const systemPrompt = SYSTEM_PROMPT
      + QuizGenerator.buildMaxQuestionsInstruction('default')
      + OUTPUT_FORMAT_INSTRUCTION;

    return {
      custom_id: `notion_page_${page.pageId}`,
      method: 'POST',
      url: '/v1/chat/completions',
      body: {
        model: 'gpt-5.2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `以下の内容から理解度チェッククイズを作成してください：\n${trimmed}` },
        ],
        response_format: { type: 'json_object' },
      },
    };
  }

  async markAsProcessing(pages: NotionSubmissionPage[], batchId: string): Promise<void> {
    for (const page of pages) {
      await this.notion.setBatchId(page.pageId, batchId);
      await this.notion.updatePageStatus(page.pageId, 'InProgress');
    }
  }

  async fetchActiveBatchIds(): Promise<string[]> {
    const pages = await this.notion.fetchInProgressPages();
    const batchIds = new Set(pages.map(p => p.batchId));
    return Array.from(batchIds);
  }

  async handleBatchCompletion(batchId: string, results: Map<string, BatchOutputLine>): Promise<void> {
    const pages = await this.notion.fetchInProgressPages();
    const targetPages = pages.filter(p => p.batchId === batchId);

    for (const page of targetPages) {
      try {
        const customId = `notion_page_${page.pageId}`;
        const outputLine = results.get(customId);

        if (!outputLine) throw new Error(`Batch 出力に custom_id=${customId} が見つかりません`);
        if (outputLine.error) throw new Error(`OpenAI エラー: ${outputLine.error.message}`);
        if (outputLine.response.status_code !== 200) throw new Error(`OpenAI レスポンスエラー: status_code=${outputLine.response.status_code}`);

        const content = outputLine.response.body.choices[0]?.message?.content;
        if (!content) throw new Error('OpenAI レスポンスに content がありません');

        const parsed = JSON.parse(content);
        const validated = GenerateQuizResponseSchema.parse(parsed);

        const quizInputs: SaveQuizInput[] = validated.quizzes.map((quiz) => ({
          id: uuidv4(),
          question: quiz.question,
          options: quiz.options.map((optText) => ({
            id: uuidv4(),
            text: optText,
            isCorrect: quiz.answers.includes(optText),
          })),
          explanation: quiz.explanation,
          category: validated.category || validated.topic || 'General',
          sourceType: 'notion',
          sourceUrl: page.sourceUrl,
        }));

        await this.quizRepo.save(quizInputs);
        await this.notion.updatePageStatus(page.pageId, 'Created');
        await this.notion.clearBatchId(page.pageId);

        console.log(`[NotionProvider] Page ${page.pageId} completed: ${quizInputs.length} quizzes saved.`);

      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[NotionProvider] Page ${page.pageId} failed:`, message);
        await this.notion.updatePageStatus(page.pageId, 'Error');
        await this.notion.writeErrorLog(page.pageId, message);
      }
    }
  }

  async handleBatchFailure(batchId: string, errorMessage: string): Promise<void> {
    const pages = await this.notion.fetchInProgressPages();
    const targetPages = pages.filter(p => p.batchId === batchId);
    for (const page of targetPages) {
      await this.notion.updatePageStatus(page.pageId, 'Error');
      await this.notion.writeErrorLog(page.pageId, errorMessage);
    }
  }
}
