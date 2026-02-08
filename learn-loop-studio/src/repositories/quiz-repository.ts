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
   * 学習セッション用のクイズを取得する。
   * 「復習すべき問題を優先的に出し、残り枠で新規問題を出す」動的な出題ロジック。
   *
   * 1. 復習クイズ: next_review_at が現在以前のもの（復習期限が来たもの）
   * 2. 新規クイズ: まだ一度も解いていないもの
   */
  async fetchStudySession(limit: number = 10): Promise<FormattedQuiz[]> {
    // ① 復習クイズ取得: 復習期限が来ているものを優先度順（古い順）で取得
    const { data: reviewRows, error: reviewError } = await this.supabase
      .from('user_progress')
      .select('quiz_id, quizzes(*)')
      .eq('user_id', this.userId)
      .eq('is_hidden', false)
      .lte('next_review_at', new Date().toISOString())
      .order('next_review_at', { ascending: true })
      .limit(limit);

    if (reviewError) {
      throw new QuizRepositoryError(`復習クイズの取得に失敗しました: ${reviewError.message}`);
    }

    // 復習クイズを整形（type: 'review' を付与）
    const reviews: FormattedQuiz[] = (reviewRows ?? [])
      .filter((row) => row.quizzes)  // quizzes が存在するもののみ
      .map((row) => ({
        ...this.formatQuizRow(row.quizzes),
        type: 'review' as const,
      }));

    // ② 残り枠で新規クイズを取得
    const remaining = limit - reviews.length;
    if (remaining <= 0) return reviews;

    // 新規クイズ: user_progress にレコードがない = まだ解いていない問題
    const { data: newRows, error: newError } = await this.supabase
      .from('quizzes')
      .select('*, user_progress!left(id)')
      .eq('user_id', this.userId)
      .is('user_progress.id', null)
      .order('created_at', { ascending: true })
      .limit(remaining);

    if (newError) {
      throw new QuizRepositoryError(`新規クイズの取得に失敗しました: ${newError.message}`);
    }

    // 新規クイズを整形（type: 'new' を付与）
    const newQuizzes: FormattedQuiz[] = (newRows ?? []).map((row) => ({
      ...this.formatQuizRow(row),
      type: 'new' as const,
    }));

    // ③ 復習クイズ + 新規クイズを結合して返す
    return [...reviews, ...newQuizzes];
  }

  /**
   * データベースから取得した quiz レコードを FormattedQuiz 形式に変換するヘルパーメソッド。
   * type フィールドは含まない（呼び出し元で付与する）。
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatQuizRow(row: any): Omit<FormattedQuiz, 'type'> {
    return {
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
    };
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
