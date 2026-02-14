import { z } from 'zod';
import { QUIZ_CATEGORIES } from './quiz-constants';

// ---------------------------------------------------------------------------
// AI クイズ生成スキーマ（Zod）
// ---------------------------------------------------------------------------
export const QuizSchema = z.object({
  question: z.string().describe(
    `## 出題ルール
1. 本質的な観点: 以下から、技術領域によらない普遍的な理解を問うこと。
   - 意図と課題 (Why): 設計の背景、解決する課題。
   - 動作原理 (Mechanism): 内部データフロー、抽象化の仕組み。
   - 選択の代償 (Trade-off): 利点と引き換えにする制約。
   - 境界と失敗 (Failure Analysis): アンチパターン、限界条件。
   - 思考の転換 (Mental Model): 従来技術との概念的な違い。
2. 状況設定: 実務でありそうな具体的なシナリオを含めること。`
  ),
  options: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe(
      `## 選択肢
- 2から4つとし、正解は1つ以上（複数選択可）とする。
- 誤答はテキストの論理を読み違えた際に陥りやすい、説得力のある内容にすること。`
    ),
  answers: z.array(z.string()).describe('正解。optionsの文字列と完全一致させること。'),
  explanation: z.string().describe(
    `## 解説
1. 論理的根拠: 正解・誤答の理由を論理的に説明する。
2. 抽象化・一般化: 普遍的な原理を補足し、他領域でも応用できる知見とする。
3. 視認性: Markdown形式で記述すること。`
  ),
  category: z
    .enum(QUIZ_CATEGORIES)
    .describe('この問題に最も適切なカテゴリ。提供されたリストの中から最も適切なものを1つ選択すること。'),
});

export const GenerateQuizResponseSchema = z.object({
  topic: z.string().describe('入力内容から抽出された主題'),
  quizzes: z
    .array(QuizSchema)
    .min(1)
    .describe('生成されたクイズのリスト。指示された問題数に従って作成する。'),
});

export type Quiz = z.infer<typeof QuizSchema>;
export type GeneratedQuizResponse = z.infer<typeof GenerateQuizResponseSchema>;
