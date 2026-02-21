-- ============================================================
-- v1.6: get_reminder_targets RPC バグ修正
-- ============================================================
-- 修正内容: AT TIME ZONE の演算子優先順位バグ
--   INTERVAL '...' AT TIME ZONE は無効 (timezone(unknown, interval) does not exist)
--   括弧を追加して (日付 + 時間間隔) を先に評価させる

CREATE OR REPLACE FUNCTION public.get_reminder_targets(
    p_current_time TIMESTAMPTZ,
    p_window_start TIMESTAMPTZ
)
RETURNS TABLE (
    user_id          UUID,
    token            TEXT,
    unanswered_count INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH unanswered AS (
    -- 当日 JST 23:59:59 までに復習期限が来ている未回答・非表示ではない問題をカウント
    SELECT
      up.user_id,
      COUNT(*)::INT AS cnt
    FROM public.user_progress up
    WHERE up.is_hidden = false
      AND up.next_review_at <= (
        -- JST で当日の終わり (23:59:59) に変換して UTC で比較
        -- ※ AT TIME ZONE は + より優先順位が高いため、括弧で加算を先に評価させる
        (
          DATE_TRUNC('day', p_current_time AT TIME ZONE 'Asia/Tokyo')
            + INTERVAL '23 hours 59 minutes 59 seconds'
        ) AT TIME ZONE 'Asia/Tokyo'
      )
    GROUP BY up.user_id
    HAVING COUNT(*) > 0
  )
  SELECT
    unanswered.user_id,
    pt.token,
    unanswered.cnt AS unanswered_count
  FROM unanswered
  -- FCM トークンを持つユーザーのみ対象
  INNER JOIN public.user_push_tokens pt
    ON pt.user_id = unanswered.user_id
  -- 今回の配信枠内にすでに通知済みのユーザーを除外（二重送信防止）
  LEFT JOIN public.user_notification_settings uns
    ON uns.user_id = unanswered.user_id
  WHERE
    uns.last_notified_at IS NULL
    OR uns.last_notified_at < p_window_start;
END;
$$;
