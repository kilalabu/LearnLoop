import { SupabaseClient } from '@supabase/supabase-js';
import { UserStats } from '@/domain/progress';

export class ProgressRepository {
  constructor(
    private supabase: SupabaseClient,
    private userId: string
  ) {}

  /**
   * 回答を記録する。
   * 初回は INSERT、2回目以降は UPDATE（attempt_count をインクリメント）。
   */
  async recordAnswer(quizId: string, isCorrect: boolean): Promise<void> {
    const now = new Date().toISOString();

    // 既存レコードを確認
    const { data: existing } = await this.supabase
      .from('user_progress')
      .select('attempt_count')
      .eq('user_id', this.userId)
      .eq('quiz_id', quizId)
      .single();

    if (existing) {
      // 2回目以降: UPDATE
      const { error } = await this.supabase
        .from('user_progress')
        .update({
          is_correct: isCorrect,
          attempt_count: existing.attempt_count + 1,
          last_answered_at: now,
        })
        .eq('user_id', this.userId)
        .eq('quiz_id', quizId);

      if (error) {
        throw new ProgressRepositoryError(`回答の更新に失敗しました: ${error.message}`);
      }
    } else {
      // 初回: INSERT
      const { error } = await this.supabase.from('user_progress').insert({
        user_id: this.userId,
        quiz_id: quizId,
        is_correct: isCorrect,
        attempt_count: 1,
        last_answered_at: now,
        forgetting_step: 0,
        is_hidden: false,
      });

      if (error) {
        throw new ProgressRepositoryError(`回答の記録に失敗しました: ${error.message}`);
      }
    }
  }

  /** ユーザーの統計情報を返す */
  async getStats(): Promise<UserStats> {
    const { data: progressList, error } = await this.supabase
      .from('user_progress')
      .select('is_correct, last_answered_at')
      .eq('user_id', this.userId);

    if (error) {
      throw new ProgressRepositoryError(`統計の取得に失敗しました: ${error.message}`);
    }

    const records = progressList ?? [];
    const totalAnswered = records.length;
    const correctCount = records.filter((r) => r.is_correct).length;
    const accuracy = totalAnswered > 0 ? correctCount / totalAnswered : 0;

    const streak = calculateStreak(
      records
        .map((r) => r.last_answered_at)
        .filter((d): d is string => d !== null)
    );

    return {
      streak,
      accuracy: Math.round(accuracy * 100) / 100,
      totalAnswered,
    };
  }
}

/**
 * 連続回答日数を計算する。
 * 最新の回答日から遡って、連続して回答がある日数を返す。
 */
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  // ユニークな日付を抽出 (YYYY-MM-DD) し降順ソート
  const uniqueDays = [
    ...new Set(dates.map((d) => new Date(d).toISOString().split('T')[0])),
  ].sort((a, b) => b.localeCompare(a));

  if (uniqueDays.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split('T')[0];

  // 最新回答日が今日または昨日でなければ streak は 0
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prevDate = new Date(uniqueDays[i - 1]);
    const currDate = new Date(uniqueDays[i]);
    const diffDays = (prevDate.getTime() - currDate.getTime()) / 86400000;

    if (Math.round(diffDays) === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export class ProgressRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProgressRepositoryError';
  }
}
