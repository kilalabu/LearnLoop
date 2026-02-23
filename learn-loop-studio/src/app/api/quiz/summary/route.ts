import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/supabase/auth';
import { HomeQueryService } from '@/services/home-query-service';

export async function GET(req: NextRequest) {
  const start = Date.now();
  try {
    const auth = await authenticateRequest(req);
    if (auth instanceof NextResponse) return auth;

    const service = new HomeQueryService(auth.supabase, auth.userId);
    const summary = await service.getSummary();

    console.log(`[API] GET /api/quiz/summary elapsed: ${Date.now() - start}ms`);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Summary API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
