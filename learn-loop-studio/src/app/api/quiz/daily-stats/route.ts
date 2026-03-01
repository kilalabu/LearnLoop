import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/supabase/auth';
import { ProgressRepository } from '@/repositories/progress-repository';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth instanceof NextResponse) return auth;

    // クエリパラメータを取得（デフォルト: limit=20, offset=0）
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit') ?? '20');
    const offset = Number(searchParams.get('offset') ?? '0');

    const repo = new ProgressRepository(auth.supabase, auth.userId);
    const stats = await repo.getDailyStats(limit, offset);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('DailyStats API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
