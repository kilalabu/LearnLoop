import { z } from 'zod';

export const QuizOptionSchema = z.string().describe("選択肢のテキスト");

export const QuizSchema = z.object({
  question: z.string().describe("問題文"),
  options: z.array(QuizOptionSchema).min(2).max(5).describe("選択肢のリスト（2〜5個）"),
  answers: z.array(z.string()).describe("正解の選択肢文字列のリスト（複数可）。optionsに含まれる文字列であること。"),
  explanation: z.string().describe("正解の理由や補足知識の解説"),
  tags: z.array(z.string()).optional().describe("推測されるジャンルやタグ"),
});

export const GenerateQuizResponseSchema = z.object({
  topic: z.string().describe("入力内容の主題"),
  quizzes: z.array(QuizSchema).describe("生成されたクイズのリスト"),
});

export type Quiz = z.infer<typeof QuizSchema>;
export type GeneratedQuizResponse = z.infer<typeof GenerateQuizResponseSchema>;
