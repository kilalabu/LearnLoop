// tests/api/quiz-summary.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../src/app/api/quiz/summary/route';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '../../src/lib/supabase/auth';
import { HomeQueryService } from '../../src/services/home-query-service';

// 依存モジュールをモック化
vi.mock('../../src/lib/supabase/auth', () => ({
  authenticateRequest: vi.fn(),
}));

// route.ts が HomeQueryService を使うようになったため、こちらをモック
vi.mock('../../src/services/home-query-service', () => ({
  HomeQueryService: vi.fn(),
}));

describe('GET /api/quiz/summary', () => {
  // テスト用ダミーリクエスト
  const makeRequest = () =>
    new NextRequest('http://localhost/api/quiz/summary', { method: 'GET' });

  // 各テストの前に全モックをリセット
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系: count と stats を並列取得してレスポンスを組み立てる', async () => {
    // Arrange: 認証成功・サービスメソッドが正常値を返す

    // authenticateRequest が { supabase, userId } を返す（認証成功）
    (authenticateRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      supabase: {},
      userId: 'user-123',
    });

    // HomeQueryService のインスタンスメソッド getSummary() をモック
    // ※ route.ts が `new HomeQueryService(...)` で使うため、コンストラクタとして動作する
    //   function キーワードを使って this にメソッドをバインドする必要がある
    const mockGetSummary = vi.fn().mockResolvedValue({
      count: 42,
      streak: 3,
      accuracy: 0.75,
      totalAnswered: 20,
    });
    (HomeQueryService as ReturnType<typeof vi.fn>).mockImplementation(function () {
      this.getSummary = mockGetSummary;
    });

    // Act
    const res = await GET(makeRequest());
    const body = await res.json();

    // Assert: HTTP ステータス 200
    expect(res.status).toBe(200);

    // レスポンスボディが正しく組み立てられていること
    expect(body).toEqual({
      count: 42,
      streak: 3,
      accuracy: 0.75,
      totalAnswered: 20,
    });

    // getSummary が呼ばれていること
    expect(mockGetSummary).toHaveBeenCalledTimes(1);
  });

  it('認証エラー: authenticateRequest が NextResponse を返した場合、早期リターンされる', async () => {
    // Arrange: 認証失敗（NextResponse 401 を返す）
    const errorResponse = NextResponse.json(
      { error: '認証が必要です。' },
      { status: 401 }
    );
    (authenticateRequest as ReturnType<typeof vi.fn>).mockResolvedValue(
      errorResponse
    );

    // Act
    const res = await GET(makeRequest());

    // Assert: 認証エラーレスポンスがそのまま返ること
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();

    // サービスは一切呼ばれていないこと（早期リターンされている）
    expect(HomeQueryService).not.toHaveBeenCalled();
  });

  it('サーバーエラー: getSummary() が例外をスローした場合、500 エラーを返す', async () => {
    // Arrange: 認証成功・サービス内で例外が発生する

    (authenticateRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      supabase: {},
      userId: 'user-123',
    });

    // getSummary() が例外をスローする
    // ※ function キーワードで this にメソッドをバインドする（コンストラクタとして動作させるため）
    const mockGetSummary = vi.fn().mockRejectedValue(new Error('DB connection failed'));
    (HomeQueryService as ReturnType<typeof vi.fn>).mockImplementation(function () {
      this.getSummary = mockGetSummary;
    });

    // Act
    const res = await GET(makeRequest());
    const body = await res.json();

    // Assert: 500 エラーが返ること
    expect(res.status).toBe(500);
    expect(body).toEqual({ error: 'サーバーエラーが発生しました。' });
  });
});
