import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient, getPlaceholderUserId } from './server';

type AuthResult = { supabase: SupabaseClient; userId: string };

/**
 * Supabase anon key + ユーザーの JWT でクライアントを生成する。
 * RLS が有効に機能し、ユーザーは自分のデータのみアクセス可能。
 */
function createAnonClient(accessToken: string): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local'
    );
  }

  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Authorization: Bearer <token> ヘッダーから JWT を検証し、
 * Supabase クライアントとユーザーIDを返す。
 *
 * 認証必須のエンドポイント用。
 *
 * @returns 成功時: { supabase, userId } / 失敗時: NextResponse (401)
 */
export async function authenticateRequest(
  req: NextRequest
): Promise<AuthResult | NextResponse> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: '認証が必要です。Authorization: Bearer <token> を設定してください。' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const supabase = createAnonClient(token);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: '無効なトークンです。再度ログインしてください。' },
      { status: 401 }
    );
  }

  return { supabase, userId: user.id };
}

/**
 * Authorization ヘッダーがあれば JWT 検証、なければサービスクライアントにフォールバック。
 *
 * 既存APIの後方互換性を維持しつつ、Flutter からの認証付きリクエストにも対応する。
 * Web管理画面からの呼び出し（ヘッダーなし）は従来通りプレースホルダーuser_idを使用。
 *
 * @returns 成功時: { supabase, userId } / JWT検証失敗時: NextResponse (401)
 */
export async function authenticateOrFallback(
  req: NextRequest
): Promise<AuthResult | NextResponse> {
  const authHeader = req.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    return authenticateRequest(req);
  }

  return {
    supabase: createServiceClient(),
    userId: getPlaceholderUserId(),
  };
}
