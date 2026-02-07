import { createClient } from '@supabase/supabase-js';

/**
 * サーバーサイド専用の Supabase クライアント（サービスロールキー使用）。
 * RLS をバイパスするため、API Routes / Server Actions でのみ使用すること。
 *
 * 認証付きクライアントに置換予定。
 */
export function createServiceClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * 認証実装前のプレースホルダー user_id を返す。
 * @deprecated Phase 1.75 以降は authenticateRequest() (auth.ts) を使用。
 * Web管理画面の後方互換のためのみ残存。
 */
export function getPlaceholderUserId(): string {
  const userId = process.env.PLACEHOLDER_USER_ID;
  if (!userId) {
    throw new Error('PLACEHOLDER_USER_ID is not set in .env.local');
  }
  return userId;
}
