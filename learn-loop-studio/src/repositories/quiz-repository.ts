import { SupabaseClient } from '@supabase/supabase-js';
import { SaveQuizInput, FormattedQuiz, QuizListItem, QuizListResponse, calculateLearningStatus, UpdateQuizInput, DbUpdateQuizInput } from '@/domain/quiz';

export class QuizRepository {
  constructor(
    private supabase: SupabaseClient,
    private userId: string
  ) { }

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
  async fetchStudySession(limit?: number, reviewLimit: number = 6): Promise<FormattedQuiz[]> {
    // デフォルトの全体上限（12件）。limit が指定されていない場合はこの値を使う
    const totalLimit = limit ?? 12;

    // ① 復習クイズ取得: quiz_view を使い、learning_status='learning' かつ復習期限が来ているものを取得
    const { data: reviewRows, error: reviewError } = await this.supabase
      .from('quiz_view')
      .select('*')
      .eq('user_id', this.userId)
      .eq('learning_status', 'learning')
      .lte('next_review_at', new Date().toISOString())
      .order('next_review_at', { ascending: true })
      .limit(reviewLimit);

    if (reviewError) {
      throw new QuizRepositoryError(`復習クイズの取得に失敗しました: ${reviewError.message}`);
    }

    // 復習クイズを整形（type: 'review' を付与）
    const reviews: FormattedQuiz[] = (reviewRows ?? []).map((row) => ({
      ...this.formatQuizRow(row as QuizRow),
      type: 'review' as const,
    }));

    // ② 残り枠（全体上限 - 取得できた復習数）で新規クイズを取得
    const remaining = totalLimit - reviews.length;

    // 全体リミットに達している場合は即時返却
    if (remaining <= 0) return reviews;

    // 新規クイズ: learning_status='unanswered' = まだ一度も解いていない問題
    const { data: newRows, error: newError } = await this.supabase
      .from('quiz_view')
      .select('*')
      .eq('user_id', this.userId)
      .eq('learning_status', 'unanswered')
      .order('created_at', { ascending: true })
      .limit(remaining);

    if (newError) {
      throw new QuizRepositoryError(`新規クイズの取得に失敗しました: ${newError.message}`);
    }

    // 新規クイズを整形（type: 'new' を付与）
    const newQuizzes: FormattedQuiz[] = (newRows ?? []).map((row) => ({
      ...this.formatQuizRow(row as QuizRow),
      type: 'new' as const,
    }));

    // ③ 復習クイズ + 新規クイズを結合して返す（合計を totalLimit 件に制限）
    return [...reviews, ...newQuizzes].slice(0, totalLimit);
  }

  /**
   * DB行を QuizListItem に変換する
   */
  private mapToQuizListItem(row: QuizViewRow): QuizListItem {
    return {
      id: row.id,
      question: row.question,
      options: row.options as { id: string; text: string; isCorrect: boolean }[],
      explanation: row.explanation,
      sourceUrl: row.source_url,
      sourceType: row.source_type,
      category: row.category,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      learningStatus: (row.learning_status as 'unanswered' | 'learning' | 'hidden') || calculateLearningStatus(row.attempt_count || 0, row.is_hidden || false),
      attemptCount: row.attempt_count || 0,
      correctCount: row.correct_count || 0,
      nextReviewAt: row.next_review_at || null,
      lastAnsweredAt: row.last_answered_at || null,
    };
  }

  /**
   * データベースから取得した quiz レコードを FormattedQuiz 形式に変換するヘルパーメソッド。
   */
  private formatQuizRow(row: QuizRow): Omit<FormattedQuiz, 'type'> {
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

  /**
   * クイズ一覧を取得する。
   * VIEW (quiz_view) を使用することで、DB側で正確なフィルタリング・ソート・ページネーションを実現します。
   * 
   * [Flutter/Compose Comparison]
   * オフセットベースのページネーション。
   * 真にスケーラブルな一覧画面を実現するため、メモリ上でのフィルタリングを廃止し、すべてDBクエリに集約しています。
   */
  async fetchList(params: {
    limit: number;
    offset: number;
    category: string | null;
    status: string | null;
    sort: string;
    order: string;
  }): Promise<QuizListResponse> {
    const { limit, offset, category, status, order } = params;

    // --- データ取得・カウント用クエリ (VIEWを使用) ---
    // quizzes と user_progress を結合した quiz_view に対してクエリを発行します。
    // PostgREST が RLS を適切に解釈し、ユーザー自身のデータのみを安全に取得します。
    let query = this.supabase
      .from('quiz_view')
      .select('*', { count: 'exact' })
      .eq('user_id', this.userId);

    // ジャンルフィルタ (DB側)
    if (category) {
      query = query.eq('category', category);
    }

    // 学習ステータスフィルタ (DB側)
    // 計算済みカラム (learning_status) を利用するため、正確な total 件数が取得可能です。
    if (status) {
      query = query.eq('learning_status', status);
    }

    // ソート
    // 現在は created_at 固定（要件の「次回出題日ソート」は将来的な拡張性のため保持しつつ、MVPでは作成日順に限定）
    const ascending = order === 'asc';
    query = query.order('created_at', { ascending });

    // ページネーション (取得範囲の指定)
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      throw new QuizRepositoryError(`一覧取得失敗: ${error.message}`);
    }

    const items: QuizListItem[] = (data ?? []).map((row) => this.mapToQuizListItem(row as QuizViewRow));

    return {
      items,
      total: count ?? 0,
      limit,
      offset,
      categories: [], // fetchList ではカテゴリを返さないように変更（最適化）
    };
  }

  /**
   * ユーザーが持っている全カテゴリ（ジャンル）を取得する。
   * 頻繁に変わらないため、fetchList とは別に呼び出すように最適化。
   */
  async getCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select('category')
      .eq('user_id', this.userId);

    if (error) {
      throw new QuizRepositoryError(`カテゴリ取得失敗: ${error.message}`);
    }

    const categories = [
      ...new Set(
        (data ?? [])
          .map((r: { category: string }) => r.category)
          .filter(Boolean)
      ),
    ].sort();

    return categories;
  }

  /** クイズを更新する */
  async update(id: string, updateData: UpdateQuizInput): Promise<QuizListItem> {
    const dbData: DbUpdateQuizInput = {
      question: updateData.question,
      options: updateData.options,
      explanation: updateData.explanation,
      category: updateData.category,
      source_url: updateData.sourceUrl,
    };

    const { data, error } = await this.supabase
      .from('quizzes')
      .update(dbData)
      .eq('id', id)
      .eq('user_id', this.userId)
      .select()
      .single();

    if (error) throw new QuizRepositoryError(`更新失敗: ${error.message}`);
    if (!data) throw new QuizRepositoryError('更新対象が見つかりません');

    const quizRow = data as QuizRow;

    // TODO: 将来的な最適化
    // 現在は更新(quizzes)と進捗取得(user_progress)で2クエリ走っている。
    // 更新後に quiz_view から select することで、1クエリに集約可能。
    const { data: progress } = await this.supabase
      .from('user_progress')
      .select('attempt_count, is_hidden, current_streak, next_review_at, last_answered_at')
      .eq('quiz_id', id)
      .single();

    return {
      ...this.mapToQuizListItem(quizRow as QuizViewRow),
      learningStatus: calculateLearningStatus(progress?.attempt_count ?? 0, progress?.is_hidden ?? false),
      attemptCount: progress?.attempt_count ?? 0,
      correctCount: progress?.current_streak ?? 0,
      nextReviewAt: progress?.next_review_at ?? null,
      lastAnsweredAt: progress?.last_answered_at ?? null,
    };
  }

  /** クイズを削除する */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('quizzes')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId);

    if (error) throw new QuizRepositoryError(`削除失敗: ${error.message}`);
  }
}

export class QuizRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizRepositoryError';
  }
}

/** 内部DB用のクイズ行型 */
interface QuizRow {
  id: string;
  question: string;
  options: unknown;
  explanation: string;
  source_url: string | null;
  source_type: string;
  category: string;
  created_at: string;
  updated_at: string;
}

/** VIEW (quiz_view) の行型 */
interface QuizViewRow extends QuizRow {
  learning_status?: string;
  attempt_count?: number;
  correct_count?: number;
  next_review_at?: string | null;
  last_answered_at?: string | null;
  is_hidden?: boolean;
}
