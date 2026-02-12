import { NextRequest, NextResponse } from 'next/server';
import { authenticateOrFallback } from '@/lib/supabase/auth';
import { QuizRepository } from '@/repositories/quiz-repository';

/**
 * GET /api/quiz/categories
 * 
 * ユーザーが持っている全てのクイズカテゴリを取得する。
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateOrFallback(req);
    if (auth instanceof NextResponse) return auth;

    const { supabase, userId } = auth;
    const repository = new QuizRepository(supabase, userId);

    const categories = await repository.getCategories();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Quiz Categories API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
