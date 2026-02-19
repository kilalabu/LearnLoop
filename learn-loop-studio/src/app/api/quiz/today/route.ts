import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/supabase/auth';
import { QuizRepository } from '@/repositories/quiz-repository';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth instanceof NextResponse) return auth;

    // クエリパラメータから取得件数を取得（デフォルト10件）
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 12;

    const repo = new QuizRepository(auth.supabase, auth.userId);
    const quizzes = await repo.fetchStudySession(limit);

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Today API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
