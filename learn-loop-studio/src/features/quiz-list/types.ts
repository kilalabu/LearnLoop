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
