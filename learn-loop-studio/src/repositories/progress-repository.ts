import { SupabaseClient } from '@supabase/supabase-js';
import { UserStats, DailyAnswerRecord, DailyStatsResponse } from '@/domain/progress';
import { calculateNextReview } from '@/services/spaced-repetition';

/** get_daily_answer_stats RPC の1行分の戻り値型 */
interface DailyAnswerStatsRow {
  date: string;
  answered_count: number;
  correct_count: number;
}

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

    // 既存レコードを確認（SM-2計算に必要なフィールドを取得）
    const { data: existing } = await this.supabase
      .from('user_progress')
      .select('attempt_count, interval, current_streak, ease_factor')
      .eq('user_id', this.userId)
      .eq('quiz_id', quizId)
      .single();

    if (existing) {
      // 2回目以降: UPDATE
      // SM-2アルゴリズムで次回復習日を計算
      const result = calculateNextReview({
        isCorrect,
        currentProgress: {
          interval: existing.interval,
          current_streak: existing.current_streak,
          ease_factor: existing.ease_factor,
          attempt_count: existing.attempt_count,
        },
      });

      const { error } = await this.supabase
        .from('user_progress')
        .update({
          is_correct: isCorrect,
          attempt_count: result.newAttemptCount,
          interval: result.newInterval,
          current_streak: result.newCurrentStreak,
          ease_factor: result.newEaseFactor,
          next_review_at: result.nextReviewAt.toISOString(),
          last_answered_at: now,
        })
        .eq('user_id', this.userId)
        .eq('quiz_id', quizId);

      if (error) {
        throw new ProgressRepositoryError(`回答の更新に失敗しました: ${error.message}`);
      }
    } else {
      // 初回: INSERT
      // SM-2アルゴリズムで次回復習日を計算（初期値から）
      const result = calculateNextReview({
        isCorrect,
        currentProgress: {
          interval: 0,
          current_streak: 0,
          ease_factor: 2.5,
          attempt_count: 0,
        },
      });

      const { error } = await this.supabase.from('user_progress').insert({
        user_id: this.userId,
        quiz_id: quizId,
        is_correct: isCorrect,
        attempt_count: result.newAttemptCount,
        interval: result.newInterval,
        current_streak: result.newCurrentStreak,
        ease_factor: result.newEaseFactor,
        next_review_at: result.nextReviewAt.toISOString(),
        last_answered_at: now,
        is_hidden: false,
      });

      if (error) {
        throw new ProgressRepositoryError(`回答の記録に失敗しました: ${error.message}`);
      }
    }

    // answer_logs に追記（正誤ログ。user_progress とは別に毎回1行保存）
    const { error: logError } = await this.supabase
      .from('answer_logs')
      .insert({
        user_id: this.userId,
        quiz_id: quizId,
        is_correct: isCorrect,
      });
    if (logError) {
      // ログの記録失敗はユーザー体験に影響しないため、エラーとしてログ出力のみ
      console.error('answer_logs の記録に失敗しました:', logError.message);
    }
  }

  /**
   * クイズの is_hidden フラグを更新する。
   * user_progress レコードが存在しない場合は何もしない（回答済みの問題のみ非表示にできる）。
   */
  async updateHidden(quizId: string, isHidden: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('user_progress')
      .update({ is_hidden: isHidden })
      .eq('user_id', this.userId)
      .eq('quiz_id', quizId);

    if (error) {
      throw new ProgressRepositoryError(`is_hidden の更新に失敗しました: ${error.message}`);
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

  async getDailyStats(
    limit: number,
    offset: number,
    date?: string   // 'YYYY-MM-DD' 形式。指定時はその日のみ返す（RPC の p_date に渡す）
  ): Promise<DailyStatsResponse> {
    // JSTで日付グループ化（UTC+9）。hasMore 判定のため limit+1 件取得する
    const { data, error } = await this.supabase.rpc('get_daily_answer_stats', {
      p_user_id: this.userId,
      p_limit: limit + 1,
      p_offset: offset,
      p_date: date ?? null,   // undefined は null として渡す（全日付対象）
    });

    if (error) throw new ProgressRepositoryError(`統計取得エラー: ${error.message}`);

    const records = data ?? [];
    const hasMore = records.length > limit;
    const history: DailyAnswerRecord[] = records.slice(0, limit).map((r: DailyAnswerStatsRow) => ({
      date: r.date,
      answeredCount: Number(r.answered_count),
      correctCount: Number(r.correct_count),
    }));

    // サーバー側定数（Flutter 側の QuizConstants と一致させる）
    const DAILY_SESSION_COUNT = 3;
    const DAILY_LIMIT = 12;

    return {
      totalRequired: DAILY_SESSION_COUNT * DAILY_LIMIT,
      history,
      hasMore,
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
