import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/supabase/auth';
import { ProgressRepository, ProgressRepositoryError } from '@/repositories/progress-repository';

/**
 * POST /api/quiz/[id]/hide
 *
 * クイズを「もう出さない」に設定する（is_hidden = true）。
 * 回答済みの問題のみ対象。user_progress レコードが存在しない場合は 0 rows affected で何もしない。
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateRequest(req);
    if (auth instanceof NextResponse) return auth;

    const repo = new ProgressRepository(auth.supabase, auth.userId);
    await repo.updateHidden(id, true);

    return NextResponse.json({ message: 'クイズを非表示にしました。' });
  } catch (error) {
    if (error instanceof ProgressRepositoryError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Quiz Hide API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
