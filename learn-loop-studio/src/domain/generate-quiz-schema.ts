import { z } from 'zod';

// ---------------------------------------------------------------------------
// AI クイズ生成スキーマ（Zod）
// ---------------------------------------------------------------------------

export const QuizOptionSchema = z.string().describe(
  "選択肢のテキスト。誤答も「よくある誤解」や「一見正解に見えるもの」にし、それ自体が学びになる内容にすること。"
);

export const QuizSchema = z.object({
  question: z.string().describe(
    "問題文。具体的かつ実践的な状況設定を含め、概念の理解や判断力を問う内容にすること。"
  ),
  options: z.array(QuizOptionSchema).min(2).max(4).describe(
    "選択肢のリスト（2〜4個）。正解は1つ以上（複数選択可）。"
  ),
  answers: z.array(z.string()).describe(
    "正解の選択肢文字列のリスト。optionsに含まれる文字列と完全一致させること。"
  ),
  explanation: z.string().describe(
    "解説。必ずMarkdown形式で記述し、コードが関連する場合はコードブロックを積極的に使用すること。比較表・太字なども活用して構造化すること。"
  ),
});

import { QUIZ_CATEGORIES } from './quiz-constants';

export const QuizCategorySchema = z.enum(QUIZ_CATEGORIES).describe(
  "入力内容から判断した最適なカテゴリ。提供されたリストの中から最も適切なものを1つ選択すること。"
);

export const GenerateQuizResponseSchema = z.object({
  topic: z.string().describe("入力内容から抽出された主題"),
  category: QuizCategorySchema,
  quizzes: z.array(QuizSchema).min(1).describe(
    "生成されたクイズのリスト。指示された問題数に従って作成する。"
  ),
});

export type Quiz = z.infer<typeof QuizSchema>;
export type GeneratedQuizResponse = z.infer<typeof GenerateQuizResponseSchema>;
