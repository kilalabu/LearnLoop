// scripts/batch/index.ts

import { BatchProcessor } from './core/batch-processor';
import { OpenAIBatchClient } from './core/openai-client';
import { NotionBatchProvider } from './providers/notion-provider';
import { StudioBatchProvider } from './providers/studio-provider';
import { SlackNotifier } from '../lib/slack-notifier';

async function main() {
  const DRY_RUN = process.argv.includes('--dry-run');

  const openai = new OpenAIBatchClient();
  const slack = new SlackNotifier();

  const processor = new BatchProcessor(
    openai,
    [
      new NotionBatchProvider(),
      new StudioBatchProvider()
    ],
    DRY_RUN
  );

  console.log('=== Batch Processing Entry Point ===');
  console.log(`Time: ${new Date().toISOString()}`);

  try {
    await processor.run();
  } catch (error) {
    console.error('Fatal Error in Batch Process:', error);
    if (!DRY_RUN) {
      await slack.notifyFatalError(error instanceof Error ? error : new Error(String(error)));
    }
    process.exit(1);
  }
}

main().catch(console.error);
