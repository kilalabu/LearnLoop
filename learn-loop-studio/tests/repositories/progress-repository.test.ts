import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProgressRepository } from '@/repositories/progress-repository';
import { createMockSupabaseClient } from '../helpers/supabase-mock';

describe('ProgressRepository', () => {
  const userId = 'user-123';

  describe('getStats() — calculateStreak', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // 今日 = 2026-02-07
      vi.setSystemTime(new Date('2026-02-07T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    /**
     * ヘルパー: getStats を呼び出すために、モックの戻り値を設定して実行する。
     * records は { is_correct, last_answered_at } の配列。
     */
    async function callGetStats(
      records: { is_correct: boolean; last_answered_at: string | null }[]
    ) {
      const mock = createMockSupabaseClient();
      mock.setResult({ data: records, error: null });
      const repo = new ProgressRepository(mock.client, userId);
      return repo.getStats();
    }

    it('連続日数が正しく計算される（連続3日, 今日のみ, 昨日のみ, 2日前, データなし）', async () => {
      // 連続3日 → streak: 3
      const stats3 = await callGetStats([
        { is_correct: true, last_answered_at: '2026-02-07T10:00:00Z' },
        { is_correct: true, last_answered_at: '2026-02-06T10:00:00Z' },
        { is_correct: true, last_answered_at: '2026-02-05T10:00:00Z' },
      ]);
      expect(stats3.streak).toBe(3);

      // 今日のみ → streak: 1
      const statsToday = await callGetStats([
        { is_correct: true, last_answered_at: '2026-02-07T10:00:00Z' },
      ]);
      expect(statsToday.streak).toBe(1);

      // 昨日のみ（今日は未回答）→ streak: 1
      const statsYesterday = await callGetStats([
        { is_correct: true, last_answered_at: '2026-02-06T10:00:00Z' },
      ]);
      expect(statsYesterday.streak).toBe(1);

      // 2日前が最新 → streak: 0（途切れ）
      const stats2daysAgo = await callGetStats([
        { is_correct: true, last_answered_at: '2026-02-05T10:00:00Z' },
      ]);
      expect(stats2daysAgo.streak).toBe(0);

      // データなし → streak: 0
      const statsEmpty = await callGetStats([]);
      expect(statsEmpty.streak).toBe(0);
    });

    it('同日複数回答・ギャップ・月跨ぎを正しく処理する', async () => {
      // 同日複数回答 → 重複除去で streak: 2（2/7 と 2/6 の2日）
      const statsDup = await callGetStats([
        { is_correct: true, last_answered_at: '2026-02-07T10:00:00Z' },
        { is_correct: false, last_answered_at: '2026-02-07T14:00:00Z' },
        { is_correct: true, last_answered_at: '2026-02-06T10:00:00Z' },
      ]);
      expect(statsDup.streak).toBe(2);

      // 連続後にギャップ → ギャップ前まで（2/7, 2/6, [gap], 2/4 → streak: 2）
      const statsGap = await callGetStats([
        { is_correct: true, last_answered_at: '2026-02-07T10:00:00Z' },
        { is_correct: true, last_answered_at: '2026-02-06T10:00:00Z' },
        { is_correct: true, last_answered_at: '2026-02-04T10:00:00Z' },
        { is_correct: true, last_answered_at: '2026-02-03T10:00:00Z' },
      ]);
      expect(statsGap.streak).toBe(2);

      // 月跨ぎ連続（3/1, 2/28, 2/27 → streak: 3）
      vi.setSystemTime(new Date('2026-03-01T12:00:00Z'));
      const statsMonth = await callGetStats([
        { is_correct: true, last_answered_at: '2026-03-01T10:00:00Z' },
        { is_correct: true, last_answered_at: '2026-02-28T10:00:00Z' },
        { is_correct: true, last_answered_at: '2026-02-27T10:00:00Z' },
      ]);
      expect(statsMonth.streak).toBe(3);
    });
  });

  describe('getStats() — accuracy', () => {
    it('accuracy が正しく計算・丸められる（7/10→0.7, 2/3→0.67, 全問正解→1, 0件→0）', async () => {
      const mock = createMockSupabaseClient();
      const repo = new ProgressRepository(mock.client, userId);

      // 7/10 → accuracy: 0.7
      mock.setResult({
        data: [
          ...Array(7).fill({ is_correct: true, last_answered_at: '2026-02-07T10:00:00Z' }),
          ...Array(3).fill({ is_correct: false, last_answered_at: '2026-02-07T10:00:00Z' }),
        ],
        error: null,
      });
      const stats70 = await repo.getStats();
      expect(stats70.accuracy).toBe(0.7);
      expect(stats70.totalAnswered).toBe(10);

      // 2/3 → accuracy: 0.67（0.6666... が丸められる）
      mock.setResult({
        data: [
          { is_correct: true, last_answered_at: '2026-02-07T10:00:00Z' },
          { is_correct: true, last_answered_at: '2026-02-07T10:00:00Z' },
          { is_correct: false, last_answered_at: '2026-02-07T10:00:00Z' },
        ],
        error: null,
      });
      const stats67 = await repo.getStats();
      expect(stats67.accuracy).toBe(0.67);

      // 全問正解 → accuracy: 1
      mock.setResult({
        data: Array(5).fill({ is_correct: true, last_answered_at: '2026-02-07T10:00:00Z' }),
        error: null,
      });
      const statsAll = await repo.getStats();
      expect(statsAll.accuracy).toBe(1);

      // データなし → accuracy: 0, totalAnswered: 0
      mock.setResult({ data: [], error: null });
      const statsNone = await repo.getStats();
      expect(statsNone.accuracy).toBe(0);
      expect(statsNone.totalAnswered).toBe(0);
    });
  });
});
