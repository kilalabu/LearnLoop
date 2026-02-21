import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/supabase/auth';
import { QuizRepository } from '@/repositories/quiz-repository';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth instanceof NextResponse) return auth;

    // クエリパラメータから取得件数を取得
    // 0・負の値・NaN は不正な値とみなし undefined 扱い
    const DECIMAL = 10; // parseInt の第2引数: 10進数として解釈する基数
    const { searchParams } = new URL(req.url);
    const rawLimit = parseInt(searchParams.get('limit') ?? '', DECIMAL);
    // 不正値・未指定の場合は 400 を返す
    if (isNaN(rawLimit) || rawLimit <= 0) {
      return NextResponse.json(
        { error: 'limit は正の整数で指定してください。' },
        { status: 400 },
      );
    }

    const repo = new QuizRepository(auth.supabase, auth.userId);
    const quizzes = await repo.fetchStudySession(rawLimit);

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Today API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
