import { SupabaseClient } from '@supabase/supabase-js';
import { SaveQuizInput, FormattedQuiz } from '@/domain/quiz';

export class QuizRepository {
  constructor(
    private supabase: SupabaseClient,
    private userId: string
  ) {}

  /** クイズを一括保存し、保存されたIDを返す */
  async save(quizzes: SaveQuizInput[]): Promise<{ savedIds: string[] }> {
    const rows = quizzes.map((quiz) => ({
      id: quiz.id,
      user_id: this.userId,
      question: quiz.question,
      options: quiz.options,
      explanation: quiz.explanation,
      category: quiz.category,
      source_type: quiz.sourceType === 'text' ? 'manual' : quiz.sourceType,
      source_url: quiz.sourceUrl || null,
    }));

    const { data, error } = await this.supabase
      .from('quizzes')
      .insert(rows)
      .select('id');

    if (error) {
      throw new QuizRepositoryError(`保存に失敗しました: ${error.message}`);
    }

    return {
      savedIds: data.map((row: { id: string }) => row.id),
    };
  }

  /**
   * 未回答クイズを取得する。
   * quizzes LEFT JOIN user_progress で、user_progress にレコードがないものを抽出。
   */
  async getTodayQuizzes(): Promise<FormattedQuiz[]> {
    const { data: quizzes, error } = await this.supabase
      .from('quizzes')
      .select(`
        *,
        user_progress!left(id)
      `)
      .eq('user_id', this.userId)
      .is('user_progress.id', null)
      .order('created_at', { ascending: true });

    if (error) {
      throw new QuizRepositoryError(`クイズの取得に失敗しました: ${error.message}`);
    }

    return (quizzes ?? []).map((row) => ({
      id: row.id,
      question: row.question,
      options: (
        row.options as { id: string; text: string; isCorrect: boolean }[]
      ).map((opt, i) => ({
        id: opt.id,
        label: String.fromCharCode(65 + i), // A, B, C, D...
        text: opt.text,
        isCorrect: opt.isCorrect,
      })),
      explanation: row.explanation,
      sourceUrl: row.source_url,
      genre: row.category,
    }));
  }

  /** クイズ総数を取得する（データ本体は取得しない） */
  async getCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId);

    if (error) {
      throw new QuizRepositoryError(`クイズ数の取得に失敗しました: ${error.message}`);
    }

    return count ?? 0;
  }
}

export class QuizRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizRepositoryError';
  }
}
