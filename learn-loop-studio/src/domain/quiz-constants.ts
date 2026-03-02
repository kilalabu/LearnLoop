// ---------------------------------------------------------------------------
// セッション定数（Flutter の QuizConstants と一致させる）
// ---------------------------------------------------------------------------
/** 1セッションあたりの出題数 */
export const DAILY_LIMIT = 12;
/** 1日あたりのセッション数 */
export const DAILY_SESSION_COUNT = 3;
/**
 * 1セッションあたりの復習クイズ上限 = DAILY_LIMIT の半分（切り捨て）
 * 奇数の場合は新規クイズを1問多くする（新規優先）
 */
export const REVIEW_LIMIT = Math.floor(DAILY_LIMIT / 2);
/** 1セッションあたりの新規クイズ上限 = DAILY_LIMIT の半分（切り上げ） */
export const NEW_LIMIT = Math.ceil(DAILY_LIMIT / 2);

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
