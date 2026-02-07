import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/supabase/auth';
import { QuizRepository } from '@/repositories/quiz-repository';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth instanceof NextResponse) return auth;

    const repo = new QuizRepository(auth.supabase, auth.userId);
    const count = await repo.getCount();

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Count API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
