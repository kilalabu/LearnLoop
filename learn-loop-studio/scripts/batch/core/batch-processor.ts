// scripts/batch/core/batch-processor.ts

import { OpenAIBatchClient } from './openai-client';
import { BatchProvider } from '../providers/base-provider';

export class BatchProcessor {
  constructor(
    private openai: OpenAIBatchClient,
    private providers: BatchProvider[],
    private dryRun: boolean = false
  ) { }

  /**
   * 全プロバイダーに対してバッチ処理を実行する
   * 処理は「送信フェーズ」と「回収フェーズ」の2段階で構成される
   */
  async run() {
    console.log(`=== Batch Processing Started (${this.dryRun ? 'DRY-RUN' : 'LIVE'}) ===`);

    for (const provider of this.providers) {
      try {
        console.log(`\n--- Provider: ${provider.name} ---`);
        // 各プロバイダー（Notion, Studio 等）ごとに独立して処理を行う
        // 片方が失敗しても、もう片方の実行を妨げないように個別に try-catch する
        await this.processProvider(provider);
      } catch (error) {
        console.error(`[BatchProcessor] Error in provider ${provider.name}:`, error);
      }
    }

    console.log('\n=== Batch Processing Completed ===');
  }

  private async processProvider(provider: BatchProvider) {
    // 1. 送信フェーズ (Submission Phase)
    const pendingItems = await provider.fetchPendingItems();
    if (pendingItems.length > 0) {
      console.log(`[${provider.name}] Found ${pendingItems.length} pending items.`);

      const requestItems = [];
      const successfulItems = [];

      for (const item of pendingItems) {
        try {
          const request = await provider.createRequestItem(item);
          requestItems.push(request);
          successfulItems.push(item);
        } catch (err) {
          console.error(`[${provider.name}] Error creating request item:`, err);
          // 各アイテムのエラーハンドリングが必要な場合はここで呼ぶ
        }
      }

      if (requestItems.length > 0) {
        if (this.dryRun) {
          console.log(`[${provider.name}][DRY-RUN] Would submit ${requestItems.length} items to OpenAI.`);
        } else {
          const jsonl = requestItems.map(item => JSON.stringify(item)).join('\n');
          const fileId = await this.openai.uploadSubmissionFile(jsonl);
          const batchId = await this.openai.submitBatch(fileId);

          await provider.markAsProcessing(successfulItems, batchId);
          console.log(`[${provider.name}] Submitted Batch: ${batchId}`);
        }
      }
    } else {
      console.log(`[${provider.name}] No pending items.`);
    }

    // 2. 回収フェーズ (Collection Phase)
    const activeBatchIds = await provider.fetchActiveBatchIds();
    if (activeBatchIds.length > 0) {
      console.log(`[${provider.name}] Checking ${activeBatchIds.length} active batches...`);

      for (const batchId of activeBatchIds) {
        try {
          const status = await this.openai.checkBatchStatus(batchId);

          if (status.status === 'completed' && status.outputFileId) {
            console.log(`[${provider.name}] Batch ${batchId} completed. Downloading results...`);

            if (this.dryRun) {
              console.log(`[${provider.name}][DRY-RUN] Would download and process results for ${batchId}.`);
            } else {
              const outputLines = await this.openai.downloadOutputFile(status.outputFileId);
              const resultsMap = new Map();
              for (const line of outputLines) {
                resultsMap.set(line.custom_id, line);
              }
              await provider.handleBatchCompletion(batchId, resultsMap);
            }
          } else if (['failed', 'expired', 'cancelled'].includes(status.status)) {
            const message = status.errorMessage || `Batch ended with status: ${status.status}`;
            console.error(`[${provider.name}] Batch ${batchId} failed: ${message}`);

            if (!this.dryRun) {
              if (provider.handleBatchFailure) {
                await provider.handleBatchFailure(batchId, message);
              }
            }
          } else {
            console.log(`[${provider.name}] Batch ${batchId} is still in status: ${status.status}`);
          }
        } catch (err) {
          console.error(`[${provider.name}] Error checking batch ${batchId}:`, err);
        }
      }
    } else {
      console.log(`[${provider.name}] No active batches to check.`);
    }
  }
}
