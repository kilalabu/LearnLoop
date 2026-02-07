import { NextRequest, NextResponse } from 'next/server';
import { authenticateOrFallback } from '@/lib/supabase/auth';

interface SaveQuizItem {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  category: string;
  sourceType: 'text' | 'url' | 'manual';
  sourceUrl?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { quizzes } = body as { quizzes: SaveQuizItem[] };

    if (!quizzes || !Array.isArray(quizzes) || quizzes.length === 0) {
      return NextResponse.json(
        { error: 'リクエストに quizzes 配列が必要です。' },
        { status: 400 }
      );
    }

    const auth = await authenticateOrFallback(req);
    if (auth instanceof NextResponse) return auth;
    const { supabase, userId } = auth;

    // フロントエンドの Problem → DB の quizzes テーブル行にマッピング
    const rows = quizzes.map((quiz) => ({
      id: quiz.id,
      user_id: userId,
      question: quiz.question,
      options: quiz.options,
      explanation: quiz.explanation,
      category: quiz.category,
      source_type: quiz.sourceType === 'text' ? 'manual' : quiz.sourceType,
      source_url: quiz.sourceUrl || null,
    }));

    const { data, error } = await supabase
      .from('quizzes')
      .insert(rows)
      .select('id');

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: `保存に失敗しました: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${data.length} 問のクイズを保存しました。`,
      savedIds: data.map((row: { id: string }) => row.id),
    });
  } catch (error) {
    console.error('Save API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
