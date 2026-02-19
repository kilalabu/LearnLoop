import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/supabase/auth';
import { ProgressRepository, ProgressRepositoryError } from '@/repositories/progress-repository';

/**
 * PATCH /api/quiz/[id]/progress
 *
 * ユーザーの学習進捗（user_progress）を部分更新する。
 * 現在サポートしているフィールド: isHidden
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { isHidden } = body as { isHidden?: boolean };

    const repo = new ProgressRepository(auth.supabase, auth.userId);

    if (typeof isHidden === 'boolean') {
      await repo.updateHidden(id, isHidden);
    }

    return NextResponse.json({ message: '進捗を更新しました。' });
  } catch (error) {
    if (error instanceof ProgressRepositoryError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Quiz Progress API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
