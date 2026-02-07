import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/supabase/auth';

/**
 * POST /api/quiz/answer
 *
 * クイズの回答を記録する。
 * user_progress テーブルに INSERT (初回) または UPDATE (2回目以降)。
 *
 * Request Body: { quizId: string, isCorrect: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth instanceof NextResponse) return auth;
    const { supabase, userId } = auth;

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

    const now = new Date().toISOString();

    // 既存レコードを確認
    const { data: existing } = await supabase
      .from('user_progress')
      .select('attempt_count')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .single();

    if (existing) {
      // 2回目以降: UPDATE (attempt_count をインクリメント)
      const { error } = await supabase
        .from('user_progress')
        .update({
          is_correct: isCorrect,
          attempt_count: existing.attempt_count + 1,
          last_answered_at: now,
        })
        .eq('user_id', userId)
        .eq('quiz_id', quizId);

      if (error) {
        console.error('Update error:', error);
        return NextResponse.json(
          { error: `回答の更新に失敗しました: ${error.message}` },
          { status: 500 }
        );
      }
    } else {
      // 初回: INSERT
      const { error } = await supabase.from('user_progress').insert({
        user_id: userId,
        quiz_id: quizId,
        is_correct: isCorrect,
        attempt_count: 1,
        last_answered_at: now,
        forgetting_step: 0,
        is_hidden: false,
      });

      if (error) {
        console.error('Insert error:', error);
        return NextResponse.json(
          { error: `回答の記録に失敗しました: ${error.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: '回答を記録しました。' });
  } catch (error) {
    console.error('Answer API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
