import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/supabase/auth';

/**
 * GET /api/quiz/today
 *
 * 今日出題すべきクイズを取得する。
 * 最小限の実装: user_progress にレコードがない未回答クイズを返す。
 * 将来的には next_review_at を参照して復習対象も含める。
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth instanceof NextResponse) return auth;
    const { supabase, userId } = auth;

    // 未回答クイズを取得: user_progress にレコードがないもの
    // quizzes LEFT JOIN user_progress → user_progress.id が NULL のものを抽出
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        user_progress!left(id)
      `)
      .eq('user_id', userId)
      .is('user_progress.id', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: `クイズの取得に失敗しました: ${error.message}` },
        { status: 500 }
      );
    }

    // DB行 → Flutter Quiz モデル形式に変換
    const formattedQuizzes = (quizzes ?? []).map((row) => ({
      id: row.id,
      question: row.question,
      options: (
        row.options as { id: string; text: string; isCorrect: boolean }[]
      ).map((opt, i) => ({
        id: opt.id,
        label: String.fromCharCode(65 + i), // A, B, C, D...
        text: opt.text,
        isCorrect: opt.isCorrect,
      })),
      explanation: row.explanation,
      sourceUrl: row.source_url,
      genre: row.category,
    }));

    return NextResponse.json({ quizzes: formattedQuizzes });
  } catch (error) {
    console.error('Today API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
