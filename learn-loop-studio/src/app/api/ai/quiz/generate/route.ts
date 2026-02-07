import { NextRequest, NextResponse } from 'next/server';
import { QuizRepository } from '@/lib/repositories/quiz-repository';

// Repositoryのインスタンス化 (シングルトンでも良いが、この規模ならリクエスト毎でも可)
// サーバーサイドでのみ動作するため、ここでnewして問題ない
const repository = new QuizRepository();

export async function POST(req: NextRequest) {
  try {
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
