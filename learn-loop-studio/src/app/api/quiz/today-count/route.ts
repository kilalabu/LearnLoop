import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/supabase/auth';
import { ProgressRepository } from '@/repositories/progress-repository';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth instanceof NextResponse) return auth;

    const repo = new ProgressRepository(auth.supabase, auth.userId);
    const count = await repo.getTodayAnsweredCount();

    return NextResponse.json({ count });
  } catch (error) {
    console.error('TodayCount API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
