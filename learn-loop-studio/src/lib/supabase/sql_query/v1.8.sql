-- v1.8: answer_logs テーブル新設 + 日付別集計 RPC 追加
-- 回答履歴を時系列で記録するログテーブル（上書きしない）
CREATE TABLE public.answer_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  is_correct boolean NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE public.answer_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own answer logs"
  ON public.answer_logs FOR ALL
  USING (auth.uid() = user_id);

-- 日付絞り込みのパフォーマンス向上
CREATE INDEX idx_answer_logs_user_answered_at
  ON public.answer_logs(user_id, answered_at);

-- 日付ごとの回答統計を取得するRPC（JST基準でグループ化）
-- AT TIME ZONE 'Asia/Tokyo' でJST変換し、深夜0〜9時（UTC前日）の回答を正しく当日分に集計する
CREATE OR REPLACE FUNCTION public.get_daily_answer_stats(
  p_user_id uuid,
  p_limit   int     DEFAULT 21,
  p_offset  int     DEFAULT 0,
  p_date    text    DEFAULT NULL   -- 'YYYY-MM-DD' 指定時はその日のみ返す（将来フェーズ用）
)
RETURNS TABLE (
  date           text,
  answered_count bigint,
  correct_count  bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    TO_CHAR(answered_at AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD') AS date,
    COUNT(*)                                                      AS answered_count,
    COUNT(*) FILTER (WHERE is_correct)                           AS correct_count
  FROM public.answer_logs
  WHERE user_id = p_user_id
    AND (p_date IS NULL OR TO_CHAR(answered_at AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD') = p_date)
  GROUP BY 1
  ORDER BY 1 DESC
  LIMIT  p_limit
  OFFSET p_offset;
$$;
