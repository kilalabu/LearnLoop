// ---------------------------------------------------------------------------
// カテゴリ定義（集中管理）
// ---------------------------------------------------------------------------
export const QUIZ_CATEGORIES = [
  'Mobile',
  'Frontend',
  'Backend',
  'Infra',
  'Data Storage',
  'Architecture',
  'CS',
  'QA',
  'AI',
  'Soft Skills',
  'Tooling',
  'Security',
  'Others',
] as const;

export type QuizCategory = (typeof QUIZ_CATEGORIES)[number];
