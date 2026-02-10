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
  sourceType: 'text' | 'url' | 'manual' | 'import';
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
