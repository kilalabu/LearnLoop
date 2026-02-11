// tests/batch/batch-processor.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BatchProcessor } from '../../scripts/batch/core/batch-processor';
import { OpenAIBatchClient } from '../../scripts/batch/core/openai-client';

describe('BatchProcessor', () => {
  let processor: BatchProcessor;
  let mockOpenAI: any;
  let mockProvider1: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOpenAI = {
      uploadSubmissionFile: vi.fn(),
      submitBatch: vi.fn(),
      checkBatchStatus: vi.fn(),
      downloadOutputFile: vi.fn(),
    };

    mockProvider1 = {
      name: 'Provider1',
      fetchPendingItems: vi.fn().mockResolvedValue([]),
      createRequestItem: vi.fn(),
      markAsProcessing: vi.fn(),
      fetchActiveBatchIds: vi.fn().mockResolvedValue([]),
      handleBatchCompletion: vi.fn(),
      handleBatchFailure: vi.fn(),
    };

    processor = new BatchProcessor(mockOpenAI as any, [mockProvider1 as any]);
  });

  describe('run', () => {
    it('正常系: 未処理アイテムの送信から、完了済みバッチの回収・保存までのフローが一気通貫で動作すること', async () => {
      // 1. 送信フェーズのモック準備 (1件の未処理アイテムがある状態)
      mockProvider1.fetchPendingItems.mockResolvedValue([{ id: '1' }]);
      mockProvider1.createRequestItem.mockResolvedValue({ custom_id: 'c1', body: {} });
      mockOpenAI.uploadSubmissionFile.mockResolvedValue('file-123');
      mockOpenAI.submitBatch.mockResolvedValue('batch-abc');

      // 2. 回収フェーズのモック準備 (完了したバッチがある状態)
      mockProvider1.fetchActiveBatchIds.mockResolvedValue(['batch-abc']);
      mockOpenAI.checkBatchStatus.mockResolvedValue({ status: 'completed', outputFileId: 'of-999' });
      mockOpenAI.downloadOutputFile.mockResolvedValue([{ custom_id: 'c1', response: { body: { choices: [] } } }]);

      // 全体フローの実行
      await processor.run();

      // 各フェーズの主要なメソッドが期待通りに呼ばれたことを検証
      expect(mockOpenAI.uploadSubmissionFile).toHaveBeenCalled();
      expect(mockOpenAI.submitBatch).toHaveBeenCalled();
      // プロバイダーに対して処理中マークと結果反映が正しく指示されたか
      expect(mockProvider1.markAsProcessing).toHaveBeenCalledWith([{ id: '1' }], 'batch-abc');
      expect(mockProvider1.handleBatchCompletion).toHaveBeenCalled();
    });
  });
});
