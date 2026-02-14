-- ============================================================
-- v1.3: 問題一覧のフィルタリング・ページネーション最適化
-- ============================================================
-- 実行前提: v1.0.sql が適用済みであること
-- 実行内容: 
--   1. user_progress に計算済みカラム (Computed Column) を追加
--   2. ページネーション・フィルタリング用の VIEW を作成
--   3. インデックスの追加
-- ============================================================

-- 1. 学習ステータスの計算済みカラムを追加
-- is_hidden, attempt_count に基づいて自動的に 'hidden' | 'unanswered' | 'learning' を算出する
-- ⚠️ 注意: この計算ロジックは src/domain/quiz.ts の calculateLearningStatus() と
-- 同期している必要があります。ロジックを変更する場合は、必ず両方を更新してください。
ALTER TABLE public.user_progress 
ADD COLUMN learning_status text 
GENERATED ALWAYS AS (
  CASE 
    WHEN is_hidden = true THEN 'hidden'
    WHEN attempt_count = 0 THEN 'unanswered'
    ELSE 'learning'
  END
) STORED;

-- 2. クイズ一覧表示用の VIEW
-- Repository でのクエリを簡潔にし、正確なページネーションを実現するために作成。
CREATE OR REPLACE VIEW public.quiz_view AS
SELECT 
  q.id,
  q.user_id,
  q.question,
  q.options,
  q.explanation,
  q.source_url,
  q.source_type,
  q.category,
  q.created_at,
  q.updated_at,
  COALESCE(up.learning_status, 'unanswered') as learning_status,
  COALESCE(up.attempt_count, 0) as attempt_count,
  COALESCE(up.current_streak, 0) as correct_count, -- current_streak を正解数として扱う
  up.next_review_at,
  up.last_answered_at
FROM public.quizzes q
LEFT JOIN public.user_progress up 
  ON q.id = up.quiz_id 
  AND q.user_id = up.user_id; -- 修正: ユーザー単位で正確に結合するための条件を追加

-- 3. パフォーマンス向上のためのインデックス
-- JOIN の高速化
CREATE INDEX IF NOT EXISTS idx_user_progress_user_quiz ON public.user_progress(user_id, quiz_id);
-- フィルタリングの高速化
CREATE INDEX IF NOT EXISTS idx_user_progress_learning_status ON public.user_progress(user_id, learning_status);
