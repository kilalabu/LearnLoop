import { NextRequest, NextResponse } from 'next/server';
import { getQuizGenerator } from '@/services/get-quiz-generator';
import { authenticateOrFallback } from '@/lib/supabase/auth';

const generator = getQuizGenerator();

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateOrFallback(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { sourceType, data, modelId } = body;

    if (!sourceType || !data) {
      return NextResponse.json(
        { error: 'Invalid request. "sourceType" and "data" are required.' },
        { status: 400 }
      );
    }

    let result;

    if (sourceType === 'url') {
      try {
        result = await generator.generateQuizFromUrl(data, modelId);
      } catch (error) {
        console.error(error);
        return NextResponse.json(
          { error: 'Failed to scrape URL or generate quiz from it.' },
          { status: 500 }
        );
      }
    } else if (sourceType === 'text') {
      if (data.length < 10) {
        return NextResponse.json(
          { error: 'Text content is too short.' },
          { status: 400 }
        );
      }
      result = await generator.generateQuizFromText(data, modelId);
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
