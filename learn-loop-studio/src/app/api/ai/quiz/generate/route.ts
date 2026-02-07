import { NextRequest, NextResponse } from 'next/server';
import { getQuizRepository } from '@/lib/repositories/get-quiz-repository';
import { authenticateOrFallback } from '@/lib/supabase/auth';

// Repositoryのインスタンス化
// サーバーサイドでのみ動作するため、ここでnewして問題ない
// USE_FAKE_AI=true の場合はFakeRepositoryが使用される
const repository = getQuizRepository();

export async function POST(req: NextRequest) {
  try {
    // 認証チェック (Bearer トークンがあれば検証、なければStudio用フォールバック)
    const auth = await authenticateOrFallback(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { sourceType, data, modelId } = body;

    // バリデーション
    if (!sourceType || !data) {
      return NextResponse.json(
        { error: 'Invalid request. "sourceType" and "data" are required.' },
        { status: 400 }
      );
    }

    let result;

    if (sourceType === 'url') {
      // URLから生成
      try {
        result = await repository.generateQuizFromUrl(data, modelId);
      } catch (error) {
        console.error(error);
        return NextResponse.json(
          { error: 'Failed to scrape URL or generate quiz from it.' },
          { status: 500 }
        );
      }
    } else if (sourceType === 'text') {
      // テキストから生成
      // 最低文字数チェックなどはRepositoryまたは呼び出し元で行うが、ここでも簡易チェック
      if (data.length < 10) {
        return NextResponse.json(
          { error: 'Text content is too short.' },
          { status: 400 }
        );
      }
      result = await repository.generateQuizFromText(data, modelId);
    } else {
      return NextResponse.json(
        { error: 'Invalid sourceType. Must be "url" or "text".' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
