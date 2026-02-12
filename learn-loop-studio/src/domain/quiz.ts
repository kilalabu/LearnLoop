// ---------------------------------------------------------------------------
// スキーマ定義の re-export（後方互換性のため）
// ---------------------------------------------------------------------------
// AI生成用スキーマ
export { QuizOptionSchema, QuizSchema, GenerateQuizResponseSchema } from './generate-quiz-schema';
export type { Quiz, GeneratedQuizResponse } from './generate-quiz-schema';

// 取り込み用スキーマ
export { ImportQuizOptionSchema, ImportQuizSchema, ImportQuizResponseSchema } from './import-quiz-schema';
export type { ImportQuiz, ImportQuizResponse } from './import-quiz-schema';

// ---------------------------------------------------------------------------
// DB 入出力型
// ---------------------------------------------------------------------------

/** save API の入力型（フロントエンドの Problem → DB 行へのマッピング用） */
export interface SaveQuizInput {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  category: string;
  sourceType: 'text' | 'url' | 'manual' | 'import' | 'notion';
  sourceUrl?: string;
}

/** today API の出力型（Flutter Quiz モデル形式） */
export interface FormattedQuiz {
  id: string;
  question: string;
  options: {
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  sourceUrl: string | null;
  genre: string;
  type?: 'review' | 'new';  // 復習クイズか新規クイズかの区分（後方互換のため optional）
}
/** クイズ一覧APIのレスポンスに含まれる個々のクイズ項目 */
export interface QuizListItem {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  sourceUrl: string | null;
  sourceType: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  learningStatus: 'unanswered' | 'learning' | 'hidden';
  attemptCount: number;
  correctCount: number;
  nextReviewAt: string | null;
  lastAnsweredAt: string | null;
}

/** クイズ一覧APIのレスポンス */
export interface QuizListResponse {
  items: QuizListItem[];
  total: number;
  limit: number;
  offset: number;
  categories: string[];
}

/** フィルタ・ソートの状態 */
export interface QuizListFilters {
  category: string | null;
  status: 'unanswered' | 'learning' | 'hidden' | null;
  sort: 'created_at' | 'next_review_at';
  order: 'asc' | 'desc';
  page: number;
}

/**
 * 学習状況（ステータス）を算出するビジネスロジック。
 * 
 * [Flutter/Compose Comparison]
 * Pure Function として定義し、ViewModel や Repository から呼び出す。
 */
export function calculateLearningStatus(
  attemptCount: number,
  isHidden: boolean
): 'unanswered' | 'learning' | 'hidden' {
  if (isHidden) return 'hidden';
  if (attemptCount === 0) return 'unanswered';
  return 'learning';
}
