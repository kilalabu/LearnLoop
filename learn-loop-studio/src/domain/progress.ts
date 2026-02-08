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
