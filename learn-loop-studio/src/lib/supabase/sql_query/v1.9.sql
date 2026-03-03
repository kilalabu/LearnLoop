-- v1.9: 今日（JST基準）の回答数を返す軽量 RPC 追加
-- date_trunc + AT TIME ZONE で範囲クエリに変換し、
-- idx_answer_logs_user_answered_at インデックスを有効活用する
CREATE OR REPLACE FUNCTION public.get_today_answered_count(
  p_user_id uuid
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer
  FROM public.answer_logs
  WHERE user_id = p_user_id
    -- JSTの今日00:00をUTC timestamptzに変換 → インデックス有効
    AND answered_at >= date_trunc('day', NOW() AT TIME ZONE 'Asia/Tokyo') AT TIME ZONE 'Asia/Tokyo'
    AND answered_at <  (date_trunc('day', NOW() AT TIME ZONE 'Asia/Tokyo') + interval '1 day') AT TIME ZONE 'Asia/Tokyo';
$$;
