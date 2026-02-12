import { NextRequest, NextResponse } from 'next/server';
import { authenticateOrFallback } from '@/lib/supabase/auth';
import { QuizRepository, QuizRepositoryError } from '@/repositories/quiz-repository';

const DEFAULT_LIMIT = 30;

/**
 * GET /api/quiz/list
 *
 * クイズ一覧を取得する。
 * ロジックは QuizRepository に委譲し、ここではリクエストの解釈とレスポンスの返却のみを行う。
 *
 * [Flutter/Compose Comparison]
 * Route Handler は ViewModel から呼ばれる Repository のラッパーのような役割。
 */
export async function GET(req: NextRequest) {
  try {
    // 認証チェック
    const auth = await authenticateOrFallback(req);
    if (auth instanceof NextResponse) return auth;

    const { supabase, userId } = auth;
    const { searchParams } = new URL(req.url);

    // クエリパラメータの解析
    const limit = Math.min(
      Number(searchParams.get('limit') || DEFAULT_LIMIT),
      100
    );
    const offset = Number(searchParams.get('offset') || 0);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    // Repository インスタンスの生成
    const repository = new QuizRepository(supabase, userId);

    // データ取得処理を Repository に委譲
    const result = await repository.fetchList({
      limit,
      offset,
      category,
      status,
      sort,
      order
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof QuizRepositoryError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Quiz List API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
