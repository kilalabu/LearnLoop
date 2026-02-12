import { NextRequest, NextResponse } from 'next/server';
import { authenticateOrFallback } from '@/lib/supabase/auth';
import { QuizRepository, QuizRepositoryError } from '@/repositories/quiz-repository';

/**
  * PATCH /api/quiz/[id]
  *
  * クイズの内容を更新する。
  * 
  * [Flutter/Compose Comparison]
  * ViewModel (useQuizList) から呼ばれる通信レイヤー。
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

    const repository = new QuizRepository(supabase, userId);
    const quiz = await repository.update(id, updateData);

    if (!quiz) {
      return NextResponse.json(
        { error: '指定されたクイズが見つかりません。' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'クイズを更新しました。',
      quiz,
    });
  } catch (error) {
    if (error instanceof QuizRepositoryError) {
      const status = error.message.includes('見つかりません') ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
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
    const repository = new QuizRepository(supabase, userId);

    await repository.delete(id);

    return NextResponse.json({
      message: 'クイズを削除しました。',
    });
  } catch (error) {
    if (error instanceof QuizRepositoryError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Quiz Delete API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
