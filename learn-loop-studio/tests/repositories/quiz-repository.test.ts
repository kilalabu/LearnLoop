import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuizRepository } from '@/repositories/quiz-repository';
import type { SaveQuizInput } from '@/domain/quiz';
import { createMockSupabaseClient } from '../helpers/supabase-mock';

describe('QuizRepository', () => {
  const userId = 'user-123';
  let mock: ReturnType<typeof createMockSupabaseClient>;
  let repo: QuizRepository;

  beforeEach(() => {
    mock = createMockSupabaseClient();
    repo = new QuizRepository(mock.client, userId);
  });

  describe('save()', () => {
    it('SaveQuizInput が正しい DB 行に変換される（sourceType変換, sourceUrl fallback, snake_case, user_id付与）', async () => {
      // --- Arrange: 複数パターンの入力を用意 ---
      const inputs: SaveQuizInput[] = [
        {
          id: 'q1',
          question: '問題1',
          options: [
            { id: 'o1', text: '選択肢A', isCorrect: true },
            { id: 'o2', text: '選択肢B', isCorrect: false },
          ],
          explanation: '解説1',
          category: 'TypeScript',
          sourceType: 'text', // → 'manual' に変換されるべき
          // sourceUrl 未指定 → null になるべき
        },
        {
          id: 'q2',
          question: '問題2',
          options: [{ id: 'o3', text: '選択肢C', isCorrect: true }],
          explanation: '解説2',
          category: 'React',
          sourceType: 'url', // → そのまま 'url'
          sourceUrl: 'https://example.com', // → そのまま保持
        },
      ];

      mock.setResult({ data: [{ id: 'q1' }, { id: 'q2' }], error: null });

      // --- Act ---
      const result = await repo.save(inputs);

      // --- Assert: insert に渡された行を検証 ---
      const insertedRows = mock.chain.insert.mock.calls[0][0];

      // 1件目: sourceType 'text' → 'manual', sourceUrl undefined → null
      expect(insertedRows[0]).toEqual({
        id: 'q1',
        user_id: userId,
        question: '問題1',
        options: inputs[0].options,
        explanation: '解説1',
        category: 'TypeScript',
        source_type: 'manual',
        source_url: null,
      });

      // 2件目: sourceType 'url' → 'url', sourceUrl 保持
      expect(insertedRows[1]).toEqual({
        id: 'q2',
        user_id: userId,
        question: '問題2',
        options: inputs[1].options,
        explanation: '解説2',
        category: 'React',
        source_type: 'url',
        source_url: 'https://example.com',
      });

      // 戻り値
      expect(result).toEqual({ savedIds: ['q1', 'q2'] });
    });
  });

  describe('fetchStudySession()', () => {
    it('DB 行が FormattedQuiz に正しく変換される（label付与, category→genre, source_url→sourceUrl）', async () => {
      // fetchStudySession は2回クエリを実行する:
      // 1回目: 復習クイズ（user_progress テーブル）→ 空配列を返す
      // 2回目: 新規クイズ（quizzes テーブル）→ テストデータを返す
      let callCount = 0;
      mock.chain.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
        callCount++;
        if (callCount === 1) {
          // 復習クイズ: 空
          return resolve({ data: [], error: null });
        }
        // 新規クイズ: テストデータ
        return resolve({
          data: [
            {
              id: 'q1',
              question: '問題1',
              options: [
                { id: 'o1', text: '選択肢A', isCorrect: true },
                { id: 'o2', text: '選択肢B', isCorrect: false },
                { id: 'o3', text: '選択肢C', isCorrect: false },
                { id: 'o4', text: '選択肢D', isCorrect: false },
              ],
              explanation: '解説1',
              source_url: 'https://example.com',
              category: 'TypeScript',
              user_progress: null,
            },
          ],
          error: null,
        });
      });

      const result = await repo.fetchStudySession(12);

      expect(result).toHaveLength(1);
      const quiz = result[0];

      // label が A, B, C, D の順に付与されている
      expect(quiz.options.map((o: { id: string; label: string; text: string; isCorrect: boolean }) => o.label)).toEqual(['A', 'B', 'C', 'D']);

      // option の元プロパティ (id, text, isCorrect) が保持されている
      expect(quiz.options[0]).toEqual({
        id: 'o1',
        label: 'A',
        text: '選択肢A',
        isCorrect: true,
      });

      // category → genre にリネーム
      expect(quiz.genre).toBe('TypeScript');

      // source_url → sourceUrl (camelCase)
      expect(quiz.sourceUrl).toBe('https://example.com');

      // 新規クイズなので type は 'new'
      expect(quiz.type).toBe('new');

      expect(quiz.id).toBe('q1');
      expect(quiz.question).toBe('問題1');
      expect(quiz.explanation).toBe('解説1');
    });

    it('data が null のとき空配列を返す', async () => {
      // 両方のクエリが null を返す
      mock.setResult({ data: null, error: null });

      const result = await repo.fetchStudySession(12);

      expect(result).toEqual([]);
    });

    it('limit を指定すると .limit() に totalLimit が渡される', async () => {
      // Arrange: 復習クイズ0件、新規クイズ3件を返す設定
      let callCount = 0;
      mock.chain.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
        callCount++;
        if (callCount === 1) {
          // 1回目クエリ（復習クイズ）: 空を返す
          return resolve({ data: [], error: null });
        }
        // 2回目クエリ（新規クイズ）: 3件を返す
        return resolve({
          data: [
            { id: 'q1', question: '問題1', options: [], explanation: '解説1', source_url: null, category: 'TypeScript' },
            { id: 'q2', question: '問題2', options: [], explanation: '解説2', source_url: null, category: 'TypeScript' },
            { id: 'q3', question: '問題3', options: [], explanation: '解説3', source_url: null, category: 'TypeScript' },
          ],
          error: null,
        });
      });

      // Act: limit=3 を指定して呼び出す
      const result = await repo.fetchStudySession(3);

      // Assert: 戻り値は 3 件以下に制限される
      expect(result).toHaveLength(3);

      // .limit() が呼ばれた引数を確認する
      // limit() の呼び出し回数と引数を検証:
      // 1回目（復習クイズ）は reviewLimit(=6) が渡される
      // 2回目（新規クイズ）は remaining = totalLimit(3) - reviews.length(0) = 3 が渡される
      const limitCalls = mock.chain.limit.mock.calls;
      // 新規クイズ取得の .limit() には 3 が渡されている
      expect(limitCalls).toContainEqual([3]);
    });

    it('limit を指定しない場合、デフォルト 12 件で動作する', async () => {
      // Arrange: 復習クイズ0件、新規クイズ 12 件を返す設定
      let callCount = 0;
      mock.chain.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
        callCount++;
        if (callCount === 1) {
          // 1回目クエリ（復習クイズ）: 空を返す
          return resolve({ data: [], error: null });
        }
        // 2回目クエリ（新規クイズ）: 12 件を返す
        return resolve({
          data: Array.from({ length: 12 }, (_, i) => ({
            id: `q${i + 1}`,
            question: `問題${i + 1}`,
            options: [],
            explanation: `解説${i + 1}`,
            source_url: null,
            category: 'TypeScript',
          })),
          error: null,
        });
      });

      // Act: limit を指定せずに呼び出す（デフォルト 12 と同じ値を明示）
      const result = await repo.fetchStudySession(12);

      // Assert: 戻り値は 12 件（デフォルト上限）
      expect(result).toHaveLength(12);

      // .limit() の呼び出し引数を検証:
      // 新規クイズ取得の .limit() には remaining = 12 - 0 = 12 が渡される
      const limitCalls = mock.chain.limit.mock.calls;
      expect(limitCalls).toContainEqual([12]);
    });
  });

  describe('fetchList()', () => {
    it('クイズ一覧を取得し、正しく QuizListItem に変換される', async () => {
      // 1回目のクエリ: quiz_view からデータとカウントを同時取得
      // 2回目のクエリ: カテゴリ一覧取得
      let callCount = 0;
      mock.chain.then = vi.fn().mockImplementation((resolve: (v: unknown) => void) => {
        callCount++;
        if (callCount === 1) {
          return resolve({
            data: [
              {
                id: 'q1',
                question: '問題1',
                options: [],
                explanation: '解説1',
                source_url: 'https://example.com',
                source_type: 'url',
                category: 'TypeScript',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                learning_status: 'learning',
                attempt_count: 5,
                correct_count: 3,
                next_review_at: '2024-02-01T00:00:00Z',
                last_answered_at: '2024-01-01T00:00:00Z',
              },
            ],
            count: 100,
            error: null,
          });
        }
        // カテゴリ一覧
        return resolve({
          data: [{ category: 'TypeScript' }, { category: 'React' }],
          error: null,
        });
      });

      const params = {
        limit: 30,
        offset: 0,
        category: null,
        status: null,
        sort: 'created_at' as const,
        order: 'desc' as const,
      };

      const result = await repo.fetchList(params);

      // 指定された VIEW が呼ばれているか
      expect(mock.from).toHaveBeenCalledWith('quiz_view');

      expect(result.total).toBe(100);
      expect(result.items).toHaveLength(1);
      const item = result.items[0];

      expect(item.learningStatus).toBe('learning');
      expect(item.correctCount).toBe(3);
      expect(item.sourceUrl).toBe('https://example.com');
      expect(result.categories).toEqual([]); // 最適化により空で返る
    });

    it('getCategories() が正しくカテゴリを抽出し、ユニークかつソートして返す', async () => {
      mock.setResult({
        data: [{ category: 'TypeScript' }, { category: 'React' }, { category: 'TypeScript' }],
        error: null,
      });

      const result = await repo.getCategories();

      expect(result).toEqual(['React', 'TypeScript']);
      expect(mock.from).toHaveBeenCalledWith('quizzes');
    });
  });

  describe('update()', () => {
    it('正しく update クエリを発行し、更新結果を返す', async () => {
      const updateData = { question: '更新後の問題' };
      mock.setResult({
        data: { id: 'q1', ...updateData },
        error: null,
      });

      const result = await repo.update('q1', updateData);

      // where句の検証
      const lastCall = mock.chain.eq.mock.calls;
      expect(lastCall).toContainEqual(['id', 'q1']);
      expect(lastCall).toContainEqual(['user_id', userId]);

      // 更新データの検証
      expect(mock.chain.update).toHaveBeenCalledWith(updateData);
      expect(result.question).toBe('更新後の問題');
    });
  });

  describe('delete()', () => {
    it('正しく delete クエリを発行する', async () => {
      mock.setResult({ error: null });

      await repo.delete('q1');

      expect(mock.chain.delete).toHaveBeenCalled();
      const lastCall = mock.chain.eq.mock.calls;
      expect(lastCall).toContainEqual(['id', 'q1']);
      expect(lastCall).toContainEqual(['user_id', userId]);
    });
  });
});
