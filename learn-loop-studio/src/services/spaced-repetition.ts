import { UserProgress } from '@/domain/progress';

/**
 * SM-2（SuperMemo 2）アルゴリズム実装
 *
 * SM-2は、ユーザーの記憶定着度を測定し、最適な復習間隔を自動計算する間隔反復アルゴリズム。
 *
 * 【アルゴリズムの概要】
 * - 正解すると復習間隔が延びる（1日→6日→15日→38日...）
 * - 不正解すると間隔がリセットされ、翌日に復習
 * - 問題ごとの難易度係数（EF: Ease Factor）を記憶し、正解した問題ほど間隔が急速に延びる
 *
 * 【用語】
 * - interval: 次回復習までの日数
 * - current_streak: 連続正解数（不正解で0にリセット）
 * - ease_factor (EF): 問題の難しさを表す係数（最小1.3）。正解で上昇、不正解で下降
 * - attempt_count: 総回答回数（分析用、リセットしない）
 * - quality (q): 解答の質を表す値（0～5）。このコードでは正解=4, 不正解=1 を使用
 */

export interface SpacedRepetitionInput {
  isCorrect: boolean;
  currentProgress: UserProgress;
}

export interface SpacedRepetitionResult {
  nextReviewAt: Date;
  newInterval: number;
  newCurrentStreak: number;
  newEaseFactor: number;
  newAttemptCount: number;
}

/**
 * SM-2アルゴリズムで次回復習日時と更新パラメータを計算
 *
 * @param input - 正誤と現在の進捗情報
 * @returns 次回復習日時と更新後の進捗パラメータ
 */
export function calculateNextReview(input: SpacedRepetitionInput): SpacedRepetitionResult {
  const { isCorrect, currentProgress } = input;
  const { interval, current_streak, ease_factor, attempt_count } = currentProgress;

  // 【ステップ1】回答回数をインクリメント
  // attempt_count は正誤に関わらず常に +1 する（累積統計用）
  const newAttemptCount = attempt_count + 1;

  // 【ステップ2】EF（難易度係数）の更新（SM-2公式）
  // quality (q): 解答の質を表す値
  //   - 正解時: 4（「正解した」）
  //   - 不正解時: 1（「完全に忘れていた」）
  // SM-2の元論文では q=0～5 の6段階だが、シンプルに正解/不正解の2値で運用
  const quality = isCorrect ? 4 : 1;

  // SM-2 EF計算式: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  //
  // 【式の意味】
  // - q が高い（正解）ほど EF が上昇 → 次回の interval がより延びる
  // - q が低い（不正解）ほど EF が下降 → 次回の interval があまり延びない
  // - EF の最小値は 1.3（これ以下にならないように制限）
  //
  // 【具体例】
  // - EF=2.5, q=4 (正解) → EF' = 2.5 + (0.1 - 1*(0.08+0.02)) = 2.5
  // - EF=2.5, q=1 (不正解) → EF' = 2.5 + (0.1 - 4*(0.08+0.02)) = 2.1
  const newEaseFactor = Math.max(
    1.3,
    ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  let newCurrentStreak: number;
  let newInterval: number;

  if (isCorrect) {
    // 【ステップ3-A】正解時の処理
    // current_streak を +1（連続正解数を記録）
    newCurrentStreak = current_streak + 1;

    // interval の計算ルール（SM-2の標準ルール）
    if (newCurrentStreak === 1) {
      // 初回正解 → 翌日復習
      newInterval = 1;
    } else if (newCurrentStreak === 2) {
      // 2連勝 → 6日後に復習
      newInterval = 6;
    } else {
      // 3連勝以上 → 前回の interval × EF で間隔を延ばす
      // ceil を使って切り上げ（最低でも1日ずつは延びるようにする）
      newInterval = Math.ceil(interval * newEaseFactor);
    }
  } else {
    // 【ステップ3-B】不正解時の処理
    // current_streak を 0 にリセット（連続正解が途切れた）
    newCurrentStreak = 0;

    // interval を 1 にリセット → 翌日に復習
    newInterval = 1;
  }

  // 【ステップ4】次回復習日時を計算
  // 現在時刻 + newInterval 日
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  return {
    nextReviewAt,
    newInterval,
    newCurrentStreak,
    newEaseFactor,
    newAttemptCount,
  };
}
