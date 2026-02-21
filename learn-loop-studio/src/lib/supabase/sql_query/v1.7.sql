-- ============================================================
-- v1.7: user_notification_settings RLS 有効化
-- ============================================================
-- 背景: v1.5 でテーブル作成時に RLS を意図的に無効にしていたが、
--       UNRESTRICTED のままでは authenticated / anon ロールからも
--       アクセス可能になってしまうため、RLS を有効化する。
--
-- 設計方針:
--   - このテーブルは service_role 専用（Push通知バッチスクリプトのみ使用）
--   - Flutter クライアントから直接アクセスしない
--   - RLS 有効 + ポリシーなし = service_role のみアクセス可能（RLS をバイパスするため）
--   - authenticated / anon ロールは暗黙的に拒否される
--
-- 実行: Supabase SQL Editor または UI の「Enable RLS for this table」で適用済み

ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- ポリシーは追加しない（意図的）
-- service_role は RLS をバイパスするため、ポリシーなしでも問題なく動作する
