import { describe, it, expect } from 'vitest';
import { calculateNextReview, SpacedRepetitionInput } from '../../src/services/spaced-repetition';


describe('SM-2アルゴリズム', () => {
  describe('calculateNextReview', () => {
    it('（初回正解）: 連続正解数が1になり、インターバルが1日になること', () => {
      // 初回正解のケース
      const input: SpacedRepetitionInput = {
        isCorrect: true,
        currentProgress: {
          interval: 0,
          current_streak: 0,
          ease_factor: 2.5,
          attempt_count: 0,
        },
      };

      const result = calculateNextReview(input);

      // 連続正解数が1になること
      expect(result.newCurrentStreak).toBe(1);

      // インターバルが1日になること
      expect(result.newInterval).toBe(1);

      // 回答回数がインクリメントされること
      expect(result.newAttemptCount).toBe(1);

      // EFは変化しない（q=4のとき EF' = 2.5 + (0.1 - 1*(0.08+0.02)) = 2.5）
      expect(result.newEaseFactor).toBe(2.5);

      // next_review_at が1日後であること
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 1);
      expect(result.nextReviewAt.getDate()).toBe(expectedDate.getDate());
    });

    it('（2連勝）: 連続正解数が2になり、インターバルが6日になること', () => {
      // 1回正解した後の2回目正解のケース
      const input: SpacedRepetitionInput = {
        isCorrect: true,
        currentProgress: {
          interval: 1,
          current_streak: 1,
          ease_factor: 2.5,
          attempt_count: 1,
        },
      };

      const result = calculateNextReview(input);

      // 連続正解数が2になること
      expect(result.newCurrentStreak).toBe(2);

      // インターバルが6日になること（SM-2の標準ルール）
      expect(result.newInterval).toBe(6);

      // 回答回数がインクリメントされること
      expect(result.newAttemptCount).toBe(2);

      // EFは変化しない
      expect(result.newEaseFactor).toBe(2.5);

      // next_review_at が6日後であること
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 6);
      expect(result.nextReviewAt.getDate()).toBe(expectedDate.getDate());
    });

    it('（3連勝以上）: インターバルが前回の値 * EF になり、正解するほど日数が伸びること', () => {
      // 2回正解した後の3回目正解のケース
      const input: SpacedRepetitionInput = {
        isCorrect: true,
        currentProgress: {
          interval: 6,
          current_streak: 2,
          ease_factor: 2.5,
          attempt_count: 2,
        },
      };

      const result = calculateNextReview(input);

      // 連続正解数が3になること
      expect(result.newCurrentStreak).toBe(3);

      // EF計算: q=4, EF' = 2.5 + (0.1 - (5-4)*(0.08+(5-4)*0.02))
      //                = 2.5 + (0.1 - 1*0.1) = 2.5
      expect(result.newEaseFactor).toBe(2.5);

      // インターバルが ceil(6 * 2.5) = 15 になること
      expect(result.newInterval).toBe(15);

      // 回答回数がインクリメントされること
      expect(result.newAttemptCount).toBe(3);

      // next_review_at が15日後であること
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 15);
      expect(result.nextReviewAt.getDate()).toBe(expectedDate.getDate());
    });

    it('（不正解）: 連続正解数が0にリセットされ、インターバルが1日に戻り、ease_factorが下がること', () => {
      // 3回正解した後に不正解のケース
      const input: SpacedRepetitionInput = {
        isCorrect: false,
        currentProgress: {
          interval: 15,
          current_streak: 3,
          ease_factor: 2.5,
          attempt_count: 3,
        },
      };

      const result = calculateNextReview(input);

      // 連続正解数が0にリセットされること
      expect(result.newCurrentStreak).toBe(0);

      // インターバルが1日にリセットされること
      expect(result.newInterval).toBe(1);

      // 回答回数がインクリメントされること
      expect(result.newAttemptCount).toBe(4);

      // EF計算: q=1, EF' = 2.5 + (0.1 - (5-1)*(0.08+(5-1)*0.02))
      //                = 2.5 + (0.1 - 4*(0.08+0.08))
      //                = 2.5 + (0.1 - 4*0.16)
      //                = 2.5 + (0.1 - 0.64)
      //                = 2.5 - 0.54 = 1.96
      expect(result.newEaseFactor).toBe(1.96);

      // next_review_at が1日後であること
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 1);
      expect(result.nextReviewAt.getDate()).toBe(expectedDate.getDate());
    });

    it('境界値テスト: EFが最小値1.3を下回らないこと', () => {
      // EFが非常に低い状態で不正解のケース
      const input: SpacedRepetitionInput = {
        isCorrect: false,
        currentProgress: {
          interval: 1,
          current_streak: 1,
          ease_factor: 1.3, // 最小値
          attempt_count: 1,
        },
      };

      const result = calculateNextReview(input);

      // EFが計算上マイナスになっても1.3で止まること
      // q=1, EF' = 1.3 + (0.1 - 4*0.16) = 1.3 - 0.54 = 0.76 → 1.3にクリップ
      expect(result.newEaseFactor).toBe(1.3);
      expect(result.newEaseFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('連続正解時のインターバル増加を確認: 4連勝以降も増え続けること', () => {
      // 3回正解後の状態（interval=15, EF=2.5）から4回目正解
      const input: SpacedRepetitionInput = {
        isCorrect: true,
        currentProgress: {
          interval: 15,
          current_streak: 3,
          ease_factor: 2.5,
          attempt_count: 3,
        },
      };

      const result = calculateNextReview(input);

      // 連続正解数が4になること
      expect(result.newCurrentStreak).toBe(4);

      // インターバルが ceil(15 * 2.5) = 38 になること
      // （正解を重ねるほど指数関数的に間隔が延びる）
      expect(result.newInterval).toBe(38);

      // 前回よりも確実に間隔が延びていること
      expect(result.newInterval).toBeGreaterThan(15);
    });
  });
});
