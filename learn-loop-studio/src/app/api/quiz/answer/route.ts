import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/supabase/auth';
import { ProgressRepository } from '@/repositories/progress-repository';

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { quizId, isCorrect } = body as {
      quizId: string;
      isCorrect: boolean;
    };

    if (!quizId || typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        { error: 'quizId (string) と isCorrect (boolean) は必須です。' },
        { status: 400 }
      );
    }

    const repo = new ProgressRepository(auth.supabase, auth.userId);
    await repo.recordAnswer(quizId, isCorrect);

    return NextResponse.json({ message: '回答を記録しました。' });
  } catch (error) {
    console.error('Answer API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
