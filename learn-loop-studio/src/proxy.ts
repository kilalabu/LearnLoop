import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS Proxy
 *
 * Flutter アプリからの API リクエストを許可するために CORS ヘッダーを付与する。
 * ネイティブモバイルアプリは CORS 制約を受けないが、
 * Flutter Web デバッグや curl テスト時に必要。
 */
export function proxy(req: NextRequest) {
  // プリフライトリクエスト (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  // 通常のレスポンスに CORS ヘッダーを追加
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(corsHeaders())) {
    response.headers.set(key, value);
  }
  return response;
}

function corsHeaders(): Record<string, string> {
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS || '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigins,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// API Routes のみに適用
export const config = {
  matcher: '/api/:path*',
};
