import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

// PDF ファイルからテキストを抽出するエンドポイント
// POST /api/pdf/extract
// Content-Type: multipart/form-data
// Body: file (PDF ファイル)
export async function POST(req: NextRequest) {
  // FormData からファイルを取得
  // Web 標準の FormData API で、モバイルの multipart/form-data と同等の概念
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { error: 'PDFファイルが見つかりません' },
      { status: 400 }
    );
  }

  // Blob → ArrayBuffer → Buffer と変換してから pdf-parse に渡す
  // Node.js の pdf-parse は Buffer を期待しているため
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // data.text に全ページのテキストが結合されて入っている
  const data = await pdfParse(buffer);

  return NextResponse.json({ text: data.text });
}
