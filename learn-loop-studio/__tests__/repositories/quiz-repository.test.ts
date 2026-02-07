import { describe, it, expect, beforeEach } from 'vitest';
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

  describe('getTodayQuizzes()', () => {
    it('DB 行が FormattedQuiz に正しく変換される（label付与, category→genre, source_url→sourceUrl）', async () => {
      // --- Arrange: DB 行を模擬 ---
      mock.setResult({
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

      // --- Act ---
      const result = await repo.getTodayQuizzes();

      // --- Assert ---
      expect(result).toHaveLength(1);
      const quiz = result[0];

      // label が A, B, C, D の順に付与されている
      expect(quiz.options.map((o) => o.label)).toEqual(['A', 'B', 'C', 'D']);

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

      // その他フィールド
      expect(quiz.id).toBe('q1');
      expect(quiz.question).toBe('問題1');
      expect(quiz.explanation).toBe('解説1');
    });

    it('data が null のとき空配列を返す', async () => {
      mock.setResult({ data: null, error: null });

      const result = await repo.getTodayQuizzes();

      expect(result).toEqual([]);
    });
  });
});
