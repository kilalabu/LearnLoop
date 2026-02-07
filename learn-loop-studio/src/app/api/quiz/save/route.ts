import { NextRequest, NextResponse } from 'next/server';
import { authenticateOrFallback } from '@/lib/supabase/auth';
import { QuizRepository } from '@/repositories/quiz-repository';
import { SaveQuizInput } from '@/domain/quiz';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quizzes } = body as { quizzes: SaveQuizInput[] };

    if (!quizzes || !Array.isArray(quizzes) || quizzes.length === 0) {
      return NextResponse.json(
        { error: 'リクエストに quizzes 配列が必要です。' },
        { status: 400 }
      );
    }

    const auth = await authenticateOrFallback(req);
    if (auth instanceof NextResponse) return auth;

    const repo = new QuizRepository(auth.supabase, auth.userId);
    const { savedIds } = await repo.save(quizzes);

    return NextResponse.json({
      message: `${savedIds.length} 問のクイズを保存しました。`,
      savedIds,
    });
  } catch (error) {
    console.error('Save API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
