-- ============================================================
-- v2.0: 忘却曲線（Spaced Repetition / SM-2）対応マイグレーション
-- ============================================================
-- 実行前提: v1.0.sql が適用済みであること
-- 実行方法: Supabase SQL Editor で手動実行
-- ============================================================

-- forgetting_step を interval にリネーム
-- interval = 次回復習までの日数（SM-2アルゴリズムで計算）
ALTER TABLE public.user_progress RENAME COLUMN forgetting_step TO interval;

-- current_streak カラム追加
-- SM-2の「連続正解数」。正解で+1、不正解で0にリセット。
-- interval 計算の分岐条件として使用（1回目→1日, 2回目→6日, 3回目以降→interval*EF）
ALTER TABLE public.user_progress ADD COLUMN current_streak int NOT NULL DEFAULT 0;

-- ease_factor カラム追加
-- SM-2の「難易度乗数」。正解で上昇、不正解で下降。最小1.3、初期値2.5。
ALTER TABLE public.user_progress ADD COLUMN ease_factor float NOT NULL DEFAULT 2.5;

-- last_answered_at のデフォルトを now() に変更
ALTER TABLE public.user_progress ALTER COLUMN last_answered_at SET DEFAULT now();

-- next_review_at のデフォルトを now() に変更
ALTER TABLE public.user_progress ALTER COLUMN next_review_at SET DEFAULT now();

-- 既存レコードの next_review_at が NULL のものを now() で埋める
-- （これにより既存の解答済み問題が「復習対象」として出現するようになる）
UPDATE public.user_progress SET next_review_at = now() WHERE next_review_at IS NULL;
