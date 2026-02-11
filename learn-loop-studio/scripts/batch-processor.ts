import { v4 as uuidv4 } from 'uuid';
import { NotionClient } from './lib/notion-client';
import { OpenAIBatchClient } from './lib/openai-batch-client';
import { SlackNotifier } from './lib/slack-notifier';
import { createServiceClient, getPlaceholderUserId } from '@/lib/supabase/client';
import { QuizRepository } from '@/repositories/quiz-repository';
import { GenerateQuizResponseSchema } from '@/domain/generate-quiz-schema';
import { SYSTEM_PROMPT, QuizGenerator } from '@/services/quiz-generator';
import { WebScraper } from '@/services/web-scraper';
import type { SaveQuizInput } from '@/domain/quiz';
import type {
  BatchOutputLine,
  BatchProcessResult,
  BatchError,
  NotionSubmissionPage,
  SubmissionRequestEntry,
} from './lib/batch-types';
import { MAX_CONTENT_LENGTH } from './lib/batch-types';

// dry-run モード: --dry-run フラグがあれば DB 書き込み・Notion 更新をスキップ
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * バッチ処理の結果回収 (Collect Batch Results)
 *
 * InProgress 状態の Notion ページを取得し、対応する OpenAI Batch の結果を回収。
 * 完了していればクイズを Supabase に保存し、Notion ステータスを更新する。
 */
export async function collectBatchResults(deps?: {
  notion?: NotionClient;
  openai?: OpenAIBatchClient;
  quizRepo?: QuizRepository;
}): Promise<BatchProcessResult> {
  // 依存性注入（テスト用）またはデフォルト生成
  const notion = deps?.notion ?? new NotionClient();
  const openai = deps?.openai ?? new OpenAIBatchClient();
  const quizRepo = deps?.quizRepo ?? (() => {
    const supabase = createServiceClient();
    const userId = getPlaceholderUserId();
    return new QuizRepository(supabase, userId);
  })();

  // 1. InProgress ページ一覧を取得
  const pages = await notion.fetchInProgressPages();
  console.log(`[CollectResults] InProgress ページ数: ${pages.length}`);

  if (pages.length === 0) {
    return { succeeded: 0, failed: 0, errors: [] };
  }

  // Batch ID でグループ化（1つの Batch に複数ページが含まれる場合がある）
  const batchGroups = new Map<string, typeof pages>();
  for (const page of pages) {
    const group = batchGroups.get(page.batchId) ?? [];
    group.push(page);
    batchGroups.set(page.batchId, group);
  }
  console.log(`[CollectResults] ユニーク Batch 数: ${batchGroups.size}`);

  let succeeded = 0;
  let failed = 0;
  const errors: BatchError[] = [];

  for (const [batchId, batchPages] of batchGroups) {
    try {
      // 2. Batch ステータス確認
      const batchResult = await openai.checkBatchStatus(batchId);

      if (batchResult.status === 'completed' && batchResult.outputFileId) {
        // --- 完了: 結果ファイルをダウンロード ---
        const outputLines = await openai.downloadOutputFile(batchResult.outputFileId);

        // custom_id → 出力行のマップを作成
        const outputMap = new Map<string, BatchOutputLine>();
        for (const line of outputLines) {
          outputMap.set(line.custom_id, line);
        }

        // ページごとにクイズを保存
        for (const page of batchPages) {
          try {
            const customId = `notion_page_${page.pageId}`;
            const outputLine = outputMap.get(customId);

            if (!outputLine) {
              throw new Error(`Batch 出力に custom_id=${customId} が見つかりません`);
            }
            if (outputLine.error) {
              throw new Error(`OpenAI エラー: ${outputLine.error.code} - ${outputLine.error.message}`);
            }
            if (outputLine.response.status_code !== 200) {
              throw new Error(`OpenAI レスポンスエラー: status_code=${outputLine.response.status_code}`);
            }

            // レスポンスの content を JSON パース + バリデーション
            const content = outputLine.response.body.choices[0]?.message?.content;
            if (!content) {
              throw new Error('OpenAI レスポンスに content がありません');
            }

            const parsed = JSON.parse(content);
            const validated = GenerateQuizResponseSchema.parse(parsed);
            console.log(`[CollectResults] Page ${page.pageId}: ${validated.quizzes.length} 問パース成功 (topic: ${validated.topic})`);

            // SaveQuizInput に変換
            const quizInputs: SaveQuizInput[] = validated.quizzes.map((quiz) => ({
              id: uuidv4(),
              question: quiz.question,
              options: quiz.options.map((optText) => ({
                id: uuidv4(),
                text: optText,
                isCorrect: quiz.answers.includes(optText),
              })),
              explanation: quiz.explanation,
              category: validated.topic,
              sourceType: 'notion' as const,
              sourceUrl: page.sourceUrl,
            }));

            if (DRY_RUN) {
              console.log(`[CollectResults][DRY-RUN] Page ${page.pageId}: ${quizInputs.length} 問を保存予定（スキップ）`);
              console.log(`[CollectResults][DRY-RUN] サンプル:`, JSON.stringify(quizInputs[0], null, 2));
            } else {
              // Supabase に保存
              const { savedIds } = await quizRepo.save(quizInputs);
              console.log(`[CollectResults] Page ${page.pageId}: ${savedIds.length} 問保存完了`);

              // Notion ステータス更新
              await notion.updatePageStatus(page.pageId, 'Created');
              await notion.clearBatchId(page.pageId);
            }
            succeeded++;

          } catch (pageError) {
            const message = pageError instanceof Error ? pageError.message : String(pageError);
            console.error(`[CollectResults] Page ${page.pageId} 処理失敗:`, message);
            errors.push({ pageId: page.pageId, message });
            failed++;

            // Notion にエラー記録（dry-run 時はスキップ）
            if (!DRY_RUN) {
              try {
                await notion.updatePageStatus(page.pageId, 'Error');
                await notion.writeErrorLog(page.pageId, message);
              } catch (notionError) {
                console.error(`[CollectResults] Notion エラー記録失敗:`, notionError);
              }
            }
          }
        }

      } else if (['failed', 'expired', 'cancelled'].includes(batchResult.status)) {
        // --- 失敗系: 全ページをエラーにする ---
        const message = `Batch ${batchResult.status}: ${batchResult.errorMessage ?? 'No details'}`;
        console.error(`[CollectResults] Batch ${batchId} 失敗: ${message}`);

        for (const page of batchPages) {
          errors.push({ pageId: page.pageId, message });
          failed++;

          if (!DRY_RUN) {
            try {
              await notion.updatePageStatus(page.pageId, 'Error');
              await notion.writeErrorLog(page.pageId, message);
            } catch (notionError) {
              console.error(`[CollectResults] Notion エラー記録失敗:`, notionError);
            }
          }
        }

      } else {
        // --- in_progress / validating / finalizing / cancelling: スキップ ---
        console.log(`[CollectResults] Batch ${batchId}: 処理中 (${batchResult.status}) のためスキップ`);
      }

    } catch (batchError) {
      // Batch レベルのエラー（API 通信失敗等）
      const message = batchError instanceof Error ? batchError.message : String(batchError);
      console.error(`[CollectResults] Batch ${batchId} API エラー:`, message);
      for (const page of batchPages) {
        errors.push({ pageId: page.pageId, message: `Batch API エラー: ${message}` });
        failed++;
      }
    }
  }

  return { succeeded, failed, errors };
}

// --------------------------------------------------------------------------
// クイズ生成のリクエスト送信 (Submit Quiz Requests)
// --------------------------------------------------------------------------

/**
 * Batch API のレスポンス形式を指示するプロンプト。
 * GenerateQuizResponseSchema の構造を自然言語で説明する。
 */
const OUTPUT_FORMAT_INSTRUCTION = `
### 出力形式
以下のJSON形式で出力してください:
{
  "topic": "入力内容から抽出された主題",
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

/**
 * クイズ生成リクエストの送信 (Submit Quiz Requests)
 *
 * Request 状態の Notion ページを取得し、コンテンツを抽出して
 * OpenAI Batch API に JSONL として送信する。
 */
export async function submitQuizRequests(deps?: {
  notion?: NotionClient;
  openai?: OpenAIBatchClient;
  scraper?: WebScraper;
}): Promise<BatchProcessResult> {
  const notion = deps?.notion ?? new NotionClient();
  const openai = deps?.openai ?? new OpenAIBatchClient();
  const scraper = deps?.scraper ?? new WebScraper();

  // 1. Request ページ取得（上限 10 件）
  const pages = await notion.fetchSubmissionPages(10);
  console.log(`[SubmitRequests] Request ページ数: ${pages.length}`);

  if (pages.length === 0) {
    return { succeeded: 0, failed: 0, errors: [] };
  }

  const entries: SubmissionRequestEntry[] = [];
  const errors: BatchError[] = [];
  let failedCount = 0;

  // 2. ページごとにコンテンツを抽出
  for (const page of pages) {
    try {
      let content = await notion.getPageContent(page.pageId);

      // Notion 本文が空 or 短すぎる場合、URL からスクレイピング
      if (content.trim().length < 50 && page.sourceUrl) {
        console.log(`[SubmitRequests] Page ${page.pageId}: 本文が短いため URL からスクレイピング: ${page.sourceUrl}`);
        content = await scraper.scrapeUrl(page.sourceUrl);
      }

      // テキストがまだ不十分な場合はスキップ
      if (content.trim().length < 50) {
        throw new Error('テキストコンテンツが不十分です（本文もURLも取得できません）');
      }

      // テキスト切り詰め
      const trimmed = content.length > MAX_CONTENT_LENGTH
        ? content.substring(0, MAX_CONTENT_LENGTH)
        : content;

      entries.push({
        pageId: page.pageId,
        content: trimmed,
        sourceUrl: page.sourceUrl,
      });

    } catch (extractError) {
      const message = extractError instanceof Error ? extractError.message : String(extractError);
      console.error(`[SubmitRequests] Page ${page.pageId} コンテンツ抽出失敗:`, message);
      errors.push({ pageId: page.pageId, message });
      failedCount++;

      // Notion にエラー記録
      if (!DRY_RUN) {
        try {
          await notion.updatePageStatus(page.pageId, 'Error');
          await notion.writeErrorLog(page.pageId, message);
        } catch (notionError) {
          console.error(`[SubmitRequests] Notion エラー記録失敗:`, notionError);
        }
      }
    }
  }

  // 抽出に成功したエントリがなければ終了
  if (entries.length === 0) {
    console.log('[SubmitRequests] 送信対象のエントリがありません');
    return { succeeded: 0, failed: failedCount, errors };
  }

  // 3. JSONL 生成
  const systemPrompt = SYSTEM_PROMPT
    + QuizGenerator.buildMaxQuestionsInstruction('default')
    + OUTPUT_FORMAT_INSTRUCTION;

  const jsonlLines = entries.map((entry) => {
    const line = {
      custom_id: `notion_page_${entry.pageId}`,
      method: 'POST',
      url: '/v1/chat/completions',
      body: {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `以下の内容から理解度チェッククイズを作成してください：\n${entry.content}` },
        ],
        response_format: { type: 'json_object' },
      },
    };
    return JSON.stringify(line);
  });

  const jsonlContent = jsonlLines.join('\n');
  console.log(`[SubmitRequests] JSONL 生成完了: ${entries.length} リクエスト, ${jsonlContent.length} chars`);

  if (DRY_RUN) {
    console.log('[SubmitRequests][DRY-RUN] JSONL 内容（先頭 1 件）:');
    console.log(jsonlLines[0]);
    console.log(`[SubmitRequests][DRY-RUN] OpenAI アップロード・Batch 送信・Notion 更新をスキップ`);
    return { succeeded: entries.length, failed: failedCount, errors };
  }

  // 4. OpenAI にアップロード & Batch 作成
  try {
    const fileId = await openai.uploadSubmissionFile(jsonlContent);
    const batchId = await openai.submitBatch(fileId);
    console.log(`[SubmitRequests] Batch 送信完了: ${batchId}`);

    // 5. Notion ページ更新（Batch ID 設定 + Status → InProgress）
    let updateSucceeded = 0;
    for (const entry of entries) {
      try {
        await notion.setBatchId(entry.pageId, batchId);
        await notion.updatePageStatus(entry.pageId, 'InProgress');
        console.log(`[SubmitRequests] Page ${entry.pageId}: InProgress に更新`);
        updateSucceeded++;
      } catch (notionError) {
        const message = notionError instanceof Error ? notionError.message : String(notionError);
        console.error(`[SubmitRequests] Page ${entry.pageId} Notion 更新失敗:`, message);
        errors.push({ pageId: entry.pageId, message: `Notion 更新失敗: ${message}` });
        failedCount++;
      }
    }

    return { succeeded: updateSucceeded, failed: failedCount, errors };

  } catch (batchError) {
    // Batch API レボーのエラー（アップロード失敗、Batch 送信失敗）
    const message = batchError instanceof Error ? batchError.message : String(batchError);
    console.error(`[SubmitRequests] Batch API エラー:`, message);

    // 送信しようとした全エントリをエラーにする
    for (const entry of entries) {
      errors.push({ pageId: entry.pageId, message: `Batch API エラー: ${message}` });
      failedCount++;

      try {
        await notion.updatePageStatus(entry.pageId, 'Error');
        await notion.writeErrorLog(entry.pageId, `Batch API エラー: ${message}`);
      } catch (notionError) {
        console.error(`[SubmitRequests] Notion エラー記録失敗:`, notionError);
      }
    }

    return { succeeded: 0, failed: failedCount, errors };
  }
}

// --------------------------------------------------------------------------
// メインエントリポイント
// --------------------------------------------------------------------------

async function main() {
  console.log('=== Notion Batch Processor 開始 ===');
  console.log(`実行時刻: ${new Date().toISOString()}`);
  if (DRY_RUN) {
    console.log('*** DRY-RUN モード: DB 書き込み・Notion 更新はスキップされます ***');
  }

  const slack = new SlackNotifier();

  try {
    // 1. バッチ結果の回収 (Collect Results)
    console.log('\n--- 結果回収 (Collect Results) ---');
    const collectResult = await collectBatchResults();
    console.log(`[CollectResults] 完了: 成功=${collectResult.succeeded}, 失敗=${collectResult.failed}`);

    // 2. 新規クイズ生成リクエストの送信 (Submit Requests)
    console.log('\n--- リクエスト送信 (Submit Requests) ---');
    const submitResult = await submitQuizRequests();
    console.log(`[SubmitRequests] 完了: 成功=${submitResult.succeeded}, 失敗=${submitResult.failed}`);

    // エラーを集約して Slack 通知
    const allErrors = [...collectResult.errors, ...submitResult.errors];
    if (allErrors.length > 0) {
      await slack.notifyErrors(allErrors);
    }

    // いずれかのステップで失敗があった場合は終了コード 1
    if (collectResult.failed > 0 || submitResult.failed > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error('致命的エラー:', error);
    await slack.notifyFatalError(error instanceof Error ? error : new Error(String(error)));
    process.exit(1);
  }

  console.log('\n=== Notion Batch Processor 完了 ===');
}

main();
