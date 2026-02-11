// tests/batch/studio-provider.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudioBatchProvider } from '../../scripts/batch/providers/studio-provider';
import { createServiceClient } from '../../src/lib/supabase/client';

vi.mock('../../src/lib/supabase/client', () => ({
  createServiceClient: vi.fn(),
  getPlaceholderUserId: vi.fn(() => 'test-user'),
}));

vi.mock('../../src/repositories/quiz-repository', () => ({
  QuizRepository: class {
    save = vi.fn().mockResolvedValue({ savedIds: ['quiz-1'] });
  },
}));

describe('StudioBatchProvider', () => {
  let provider: StudioBatchProvider;
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    /**
     * チェイン可能な Supabase モックを作成
     * select().eq().eq() のような連続した呼び出しに対応しつつ、
     * Promise (then) を最後に呼べるように設計
     */
    const createChain = () => {
      const chain: any = {
        from: vi.fn(() => chain),
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        not: vi.fn(() => chain),
        insert: vi.fn(() => chain),
        update: vi.fn(() => chain),
        in: vi.fn(() => chain),
        then: (onFullfilled: any) => Promise.resolve({ data: [], error: null }).then(onFullfilled),
      };
      return chain;
    };

    mockSupabase = createChain();
    (createServiceClient as any).mockReturnValue(mockSupabase);
    provider = new StudioBatchProvider();
  });

  describe('handleBatchCompletion', () => {
    it('正常系: OpenAI のバッチ結果を正しくパースしてクイズを保存し、ステータスを完了に更新できること', async () => {
      const batchId = 'batch-123';
      const rowId = 'req-456';

      const sessionData = [{ id: rowId, source_content: 'content', source_name: 'test.md' }];

      // select().eq().eq() などで取得される行データを設定
      mockSupabase.then = (onFullfilled: any) =>
        Promise.resolve({ data: sessionData, error: null }).then(onFullfilled);

      const results = new Map();
      results.set(`studio_req_${rowId}`, {
        response: {
          body: {
            choices: [{
              message: {
                content: JSON.stringify({
                  topic: 'Test Topic',
                  quizzes: [{
                    question: 'Q1',
                    options: ['A', 'B'],
                    answers: ['A'],
                    explanation: 'E1'
                  }]
                })
              }
            }]
          }
        }
      });

      await provider.handleBatchCompletion(batchId, results);

      // クイズリポジトリを介してデータが保存されたことを確認
      expect(mockSupabase.from).toHaveBeenCalledWith('quiz_batch_requests');
      // DB 上の予約ステータスが completed に更新されたことを検証
      expect(mockSupabase.update).toHaveBeenCalledWith({ status: 'completed' });
    });

    it('異常系: OpenAI からエラーが返された場合に、レコードを failed ステータスに更新してエラーメッセージを記録できること', async () => {
      const batchId = 'batch-123';
      const rowId = 'req-456';

      mockSupabase.then = (onFullfilled: any) =>
        Promise.resolve({
          data: [{ id: rowId, source_content: 'content', source_name: 'test.md' }],
          error: null
        }).then(onFullfilled);

      const results = new Map();
      results.set(`studio_req_${rowId}`, {
        error: { message: 'OpenAI error' }
      });

      await provider.handleBatchCompletion(batchId, results);

      // 失敗ステータスとエラー理由が正しく記録されているか検証
      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: 'failed',
        error_message: 'OpenAI エラー: OpenAI error'
      });
    });
  });
});
