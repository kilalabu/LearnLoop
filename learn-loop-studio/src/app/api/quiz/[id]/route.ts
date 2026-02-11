import { NextRequest, NextResponse } from 'next/server';
import { authenticateOrFallback } from '@/lib/supabase/auth';

/**
 * PATCH /api/quiz/[id]
 *
 * クイズの内容を更新する。
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateOrFallback(req);
    if (auth instanceof NextResponse) return auth;

    const { supabase, userId } = auth;
    const body = await req.json();

    const updateData: Record<string, unknown> = {};
    if (body.question !== undefined) updateData.question = body.question;
    if (body.options !== undefined) updateData.options = body.options;
    if (body.explanation !== undefined) updateData.explanation = body.explanation;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.sourceUrl !== undefined) updateData.source_url = body.sourceUrl;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '更新するフィールドが指定されていません。' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('quizzes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`更新に失敗しました: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        { error: '指定されたクイズが見つかりません。' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'クイズを更新しました。',
      quiz: data,
    });
  } catch (error) {
    console.error('Quiz Update API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quiz/[id]
 *
 * クイズを削除する。関連する user_progress も CASCADE で削除される。
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateOrFallback(req);
    if (auth instanceof NextResponse) return auth;

    const { supabase, userId } = auth;

    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`削除に失敗しました: ${error.message}`);
    }

    return NextResponse.json({
      message: 'クイズを削除しました。',
    });
  } catch (error) {
    console.error('Quiz Delete API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
