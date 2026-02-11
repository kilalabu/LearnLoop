// src/app/api/quiz/register-batch/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateOrFallback } from '@/lib/supabase/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateOrFallback(req);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { files } = body;

    // 非同期の Batch 生成を前提としているため、一度に大量のファイルを受け取れるように設計
    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. "files" array is required.' },
        { status: 400 }
      );
    }

    // 各ファイルの最低限の整合性チェック
    // content が極端に短い場合、AI の生成品質が下がる（またはエラーになる）ため 20文字で制限
    for (const file of files) {
      if (!file.name || !file.content || file.content.length < 20) {
        return NextResponse.json(
          { error: `Invalid file data for ${file.name || 'unknown file'}. Name and sufficient content are required.` },
          { status: 400 }
        );
      }
    }

    const supabase = createServiceClient();

    // quiz_batch_requests に一括挿入
    const rows = files.map((file) => ({
      user_id: auth.userId,
      source_name: file.name,
      source_content: file.content,
      status: 'pending',
    }));

    const { data, error } = await supabase
      .from('quiz_batch_requests')
      .insert(rows)
      .select('id');

    if (error) {
      console.error('Database Error:', error);
      return NextResponse.json(
        { error: 'Failed to register batch requests.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${data.length} files successfully registered for batch processing.`,
      count: data.length
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
