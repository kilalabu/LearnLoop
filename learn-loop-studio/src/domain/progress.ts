/** stats API の出力型 */
export interface UserStats {
  streak: number;
  accuracy: number;
  totalAnswered: number;
}

/**
 * user_progress テーブルの行型（SM-2 計算に必要なフィールド）
 * - interval: 次回復習までの日数
 * - current_streak: 連続正解数（不正解で0リセット）
 * - ease_factor: 難易度乗数（正解で上昇、不正解で下降、最小1.3）
 * - attempt_count: 総回答回数（分析用、リセットしない）
 */
export interface UserProgress {
  interval: number;
  current_streak: number;
  ease_factor: number;
  attempt_count: number;
}

/** 1日分の回答統計 */
export interface DailyAnswerRecord {
  date: string;          // 'YYYY-MM-DD'（JST）
  answeredCount: number; // その日の回答数
  correctCount: number;  // その日の正答数
}

/** daily-stats API のレスポンス型 */
export interface DailyStatsResponse {
  totalRequired: number;          // 1日に解くべき総問題数（dailySessionCount × dailyLimit）
  history: DailyAnswerRecord[];   // 日付降順の一覧
  hasMore: boolean;               // さらに古いデータがあるか
}
