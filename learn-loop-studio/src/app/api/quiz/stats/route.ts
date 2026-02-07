import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/supabase/auth';

/**
 * GET /api/quiz/stats
 *
 * ユーザーの統計情報を返す。
 * { streak: number, accuracy: number, totalAnswered: number }
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth instanceof NextResponse) return auth;
    const { supabase, userId } = auth;

    const { data: progressList, error } = await supabase
      .from('user_progress')
      .select('is_correct, last_answered_at')
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase stats error:', error);
      return NextResponse.json(
        { error: `統計の取得に失敗しました: ${error.message}` },
        { status: 500 }
      );
    }

    const records = progressList ?? [];
    const totalAnswered = records.length;
    const correctCount = records.filter((r) => r.is_correct).length;
    const accuracy = totalAnswered > 0 ? correctCount / totalAnswered : 0;

    const streak = calculateStreak(
      records
        .map((r) => r.last_answered_at)
        .filter((d): d is string => d !== null)
    );

    return NextResponse.json({
      streak,
      accuracy: Math.round(accuracy * 100) / 100,
      totalAnswered,
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

/**
 * 連続回答日数を計算する。
 * 最新の回答日から遡って、連続して回答がある日数を返す。
 */
function calculateStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  // ユニークな日付を抽出 (YYYY-MM-DD) し降順ソート
  const uniqueDays = [
    ...new Set(dates.map((d) => new Date(d).toISOString().split('T')[0])),
  ].sort((a, b) => b.localeCompare(a));

  if (uniqueDays.length === 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split('T')[0];

  // 最新回答日が今日または昨日でなければ streak は 0
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const prevDate = new Date(uniqueDays[i - 1]);
    const currDate = new Date(uniqueDays[i]);
    const diffDays = (prevDate.getTime() - currDate.getTime()) / 86400000;

    if (Math.round(diffDays) === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
