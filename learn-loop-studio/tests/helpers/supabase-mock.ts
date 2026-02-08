import type { SupabaseClient } from '@supabase/supabase-js';
import { vi } from 'vitest';

/**
 * Supabase のチェーンAPI をモック化するファクトリ。
 * 各テストで `resolveValue` を設定して戻り値を制御する。
 */
export function createMockSupabaseClient() {
  // 最終的に resolve される値を外から設定可能にする
  let resolveValue: { data?: unknown; error?: unknown; count?: unknown } = {
    data: null,
    error: null,
  };

  const chain: Record<string, ReturnType<typeof vi.fn>> = {};

  // すべてのチェーンメソッドが自身（chain）を返し、
  // await 時に resolveValue を返す（thenable パターン）
  const methods = [
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'is',
    'order',
    'single',
    'lte',
    'gte',
    'lt',
    'gt',
    'limit',
    'filter',
  ];

  for (const method of methods) {
    chain[method] = vi.fn().mockImplementation(() => chain);
  }

  // await chain で resolveValue が返る
  chain.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
    return resolve(resolveValue);
  });

  const from = vi.fn().mockImplementation(() => chain);

  const client = { from } as unknown as SupabaseClient;

  return {
    client,
    from,
    chain,
    /** 次の await 結果を設定する */
    setResult(result: {
      data?: unknown;
      error?: unknown;
      count?: unknown;
    }) {
      resolveValue = result;
    },
  };
}
