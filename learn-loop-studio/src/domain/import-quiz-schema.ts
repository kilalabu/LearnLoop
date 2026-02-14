import { z } from 'zod';
import { QUIZ_CATEGORIES } from './quiz-constants';

// ---------------------------------------------------------------------------
// クイズ取り込み用 AI スキーマ（Zod）
// ---------------------------------------------------------------------------

export const ImportQuizOptionSchema = z.string().describe(
  "選択肢のテキスト。原文の選択肢をそのまま抽出し、記号（A), B) 等）は除去してテキスト部分のみとすること。"
);

export const ImportQuizSchema = z.object({
  question: z.string().describe(
    "問題文。問題番号や接頭辞（Q1, 問1等）は除外し、純粋な本文のみとすること。"
  ),
  options: z.array(ImportQuizOptionSchema).min(2).describe(
    "選択肢のリスト（2個以上）。原文に含まれる選択肢をすべて抽出すること。記号（A), B) 等）は除去してテキスト部分のみとすること。"
  ),
  answers: z.array(z.string()).describe(
    "正解の選択肢文字列のリスト。optionsに含まれる文字列と完全一致させること。"
  ),
  explanation: z.string().describe(
    "解説。原文の解説をそのまま保持すること。コードブロック、表、リスト、ネストされた詳細などのマークダウン記法はすべて維持すること。"
  ),
  category: z.enum(QUIZ_CATEGORIES).describe("この問題に最も適切なカテゴリ"),
});

export const ImportQuizResponseSchema = z.object({
  topic: z.string().describe("入力内容から抽出された主題"),
  quizzes: z.array(ImportQuizSchema).min(1).describe(
    "取り込まれたクイズのリスト。入力に含まれるすべてのクイズを抽出すること。"
  ),
});

export type ImportQuiz = z.infer<typeof ImportQuizSchema>;
export type ImportQuizResponse = z.infer<typeof ImportQuizResponseSchema>;
