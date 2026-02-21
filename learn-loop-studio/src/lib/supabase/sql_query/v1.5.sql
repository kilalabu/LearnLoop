-- ============================================================
-- v1.5: Push通知 Phase 1
-- ============================================================
-- 実行前提: v1.4.sql が適用済みであること
-- 実行場所: Supabase SQL Editor で手動実行

-- 1. FCMトークン管理テーブル
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
    token TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('ios', 'android')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- ユーザー自身のトークンのみ管理可能（バッチは service_role でバイパス）
CREATE POLICY "Users can manage their own push tokens"
  ON public.user_push_tokens FOR ALL
  USING (auth.uid() = user_id);

CREATE TRIGGER handle_updated_at_user_push_tokens
  BEFORE UPDATE ON public.user_push_tokens
  FOR EACH ROW EXECUTE PROCEDURE moddatetime(updated_at);

-- 2. 通知設定・履歴テーブル（二重送信防止）
-- RLS なし: service_role 専用テーブル。Flutter クライアントから直接アクセスしない
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    last_notified_at TIMESTAMPTZ
);

-- 3. インデックス
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id
  ON public.user_push_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_user_progress_next_review_user
  ON public.user_progress(user_id, next_review_at)
  WHERE is_hidden = false;

-- 4. 配信対象抽出 RPC
-- バッチスクリプトから1クエリで「配信対象者・未回答数・FCMトークン」を取得する
-- ストリーク計算はバッチスクリプト（TypeScript）側で行うため、RPC では行わない
-- 引数:
--   p_current_time: 配信実行時刻 (UTC)
--   p_window_start: 配信枠開始時刻 (UTC) - この時刻以降に通知済みのユーザーは除外
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
        DATE_TRUNC('day', p_current_time AT TIME ZONE 'Asia/Tokyo')
          + INTERVAL '23 hours 59 minutes 59 seconds'
          AT TIME ZONE 'Asia/Tokyo'
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
