// tests/api/register-batch.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../src/app/api/quiz/register-batch/route';
import { NextRequest } from 'next/server';
import { createServiceClient } from '../../src/lib/supabase/client';
import { authenticateOrFallback } from '../../src/lib/supabase/auth';

vi.mock('../../src/lib/supabase/client', () => ({
  createServiceClient: vi.fn(),
}));

vi.mock('../../src/lib/supabase/auth', () => ({
  authenticateOrFallback: vi.fn(),
}));

describe('POST /api/quiz/register-batch', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    const createChain = () => {
      const chain: any = {
        from: vi.fn(() => chain),
        insert: vi.fn(() => chain),
        select: vi.fn(() => chain),
        then: (resolve: any) => resolve({ data: [], error: null }),
      };
      return chain;
    };
    mockSupabase = createChain();
    (createServiceClient as any).mockReturnValue(mockSupabase);
  });

  it('バリデーション: files 配列が空、または存在しない場合に 400 エラーを返すこと', async () => {
    (authenticateOrFallback as any).mockResolvedValue({ userId: 'user-1' });
    const req = new NextRequest('http://localhost/api/quiz/register-batch', {
      method: 'POST',
      body: JSON.stringify({ files: [] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('正常系: 有効な複数ファイルの内容を DB に pending 状態で一括登録できること', async () => {
    (authenticateOrFallback as any).mockResolvedValue({ userId: 'user-1' });

    // DB 保存成功をモック
    mockSupabase.then = (resolve: any) => resolve({
      data: [{ id: '1' }, { id: '2' }],
      error: null
    });

    const req = new NextRequest('http://localhost/api/quiz/register-batch', {
      method: 'POST',
      body: JSON.stringify({
        files: [
          { name: 'test1.md', content: 'This is a test content that is long enough.' },
          { name: 'test2.md', content: 'This is another test content that is also long enough.' },
        ],
      }),
    });

    const res = await POST(req);

    // HTTP ステータスとレスポンス内容の検証
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.count).toBe(2);

    // 正しいユーザー ID とステータスで insert が呼ばれたことを検証
    expect(mockSupabase.from).toHaveBeenCalledWith('quiz_batch_requests');
  });
});
