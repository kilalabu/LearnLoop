import { NextRequest, NextResponse } from 'next/server';
import { authenticateOrFallback } from '@/lib/supabase/auth';

const DEFAULT_LIMIT = 30;

/**
 * GET /api/quiz/list
 *
 * クイズ一覧を取得する。quizzes と user_progress を結合し、
 * ページネーション・フィルタ・ソートに対応。
 *
 * Query Params:
 *   - limit: number (default 30)
 *   - offset: number (default 0)
 *   - category: string (ジャンルフィルタ)
 *   - status: 'unanswered' | 'learning' | 'hidden' (学習ステータスフィルタ)
 *   - sort: 'created_at' | 'next_review_at' (default 'created_at')
 *   - order: 'asc' | 'desc' (default 'desc')
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateOrFallback(req);
    if (auth instanceof NextResponse) return auth;

    const { supabase, userId } = auth;
    const { searchParams } = new URL(req.url);

    const limit = Math.min(
      Number(searchParams.get('limit') || DEFAULT_LIMIT),
      100
    );
    const offset = Number(searchParams.get('offset') || 0);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    // --- カウント用クエリ ---
    let countQuery = supabase
      .from('quizzes')
      .select('*, user_progress!left(id, is_hidden)', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (category) {
      countQuery = countQuery.eq('category', category);
    }

    // --- データ取得クエリ ---
    let dataQuery = supabase
      .from('quizzes')
      .select(
        `
        id,
        question,
        options,
        explanation,
        source_url,
        source_type,
        category,
        created_at,
        updated_at,
        user_progress!left(
          id,
          is_correct,
          attempt_count,
          interval,
          current_streak,
          ease_factor,
          next_review_at,
          last_answered_at,
          is_hidden
        )
      `
      )
      .eq('user_id', userId);

    if (category) {
      dataQuery = dataQuery.eq('category', category);
    }

    // ソート適用
    const ascending = order === 'asc';
    if (sort === 'next_review_at') {
      // next_review_at は user_progress 側にあるため、created_at でフォールバック
      dataQuery = dataQuery.order('created_at', { ascending });
    } else {
      dataQuery = dataQuery.order('created_at', { ascending });
    }

    dataQuery = dataQuery.range(offset, offset + limit - 1);

    // 並列実行
    const [countResult, dataResult] = await Promise.all([
      countQuery,
      dataQuery,
    ]);

    if (countResult.error) {
      throw new Error(`カウント取得失敗: ${countResult.error.message}`);
    }
    if (dataResult.error) {
      throw new Error(`データ取得失敗: ${dataResult.error.message}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items = (dataResult.data ?? []).map((row: any) => {
      const progress = Array.isArray(row.user_progress)
        ? row.user_progress[0]
        : row.user_progress;

      const attemptCount = progress?.attempt_count ?? 0;
      const isHidden = progress?.is_hidden ?? false;

      let learningStatus: 'unanswered' | 'learning' | 'hidden';
      if (isHidden) {
        learningStatus = 'hidden';
      } else if (attemptCount === 0) {
        learningStatus = 'unanswered';
      } else {
        learningStatus = 'learning';
      }

      // 正答数の計算: is_correct は直近のみのため、attempt_count と current_streak から推定
      const correctCount = progress?.current_streak ?? 0;

      return {
        id: row.id,
        question: row.question,
        options: row.options,
        explanation: row.explanation,
        sourceUrl: row.source_url,
        sourceType: row.source_type,
        category: row.category,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        learningStatus,
        attemptCount,
        correctCount,
        nextReviewAt: progress?.next_review_at ?? null,
        lastAnsweredAt: progress?.last_answered_at ?? null,
      };
    });

    // クライアントサイドでステータスフィルタリング
    if (status) {
      items = items.filter(
        (item: { learningStatus: string }) => item.learningStatus === status
      );
    }

    // next_review_at ソートの場合はクライアントサイドでソート
    if (sort === 'next_review_at') {
      items.sort(
        (
          a: { nextReviewAt: string | null },
          b: { nextReviewAt: string | null }
        ) => {
          const aDate = a.nextReviewAt
            ? new Date(a.nextReviewAt).getTime()
            : Infinity;
          const bDate = b.nextReviewAt
            ? new Date(b.nextReviewAt).getTime()
            : Infinity;
          return ascending ? aDate - bDate : bDate - aDate;
        }
      );
    }

    // カテゴリ一覧を取得（フィルタUI用）
    const { data: categoriesData } = await supabase
      .from('quizzes')
      .select('category')
      .eq('user_id', userId);

    const categories = [
      ...new Set(
        (categoriesData ?? [])
          .map((r: { category: string }) => r.category)
          .filter(Boolean)
      ),
    ].sort();

    return NextResponse.json({
      items,
      total: countResult.count ?? 0,
      limit,
      offset,
      categories,
    });
  } catch (error) {
    console.error('Quiz List API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
