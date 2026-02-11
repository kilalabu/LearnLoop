// ---------------------------------------------------------------------------
// Notion Batch 処理の型定義
// ---------------------------------------------------------------------------

/** Notion ページの処理に必要な情報 */
export interface NotionBatchPage {
  /** Notion ページ ID */
  pageId: string;
  /** OpenAI Batch API のバッチ ID */
  batchId: string;
  /** Notion ページの URL プロパティ（source_url として保存） */
  sourceUrl?: string;
}

/** Batch API の JSONL 1行分の構造 */
export interface BatchOutputLine {
  /** バッチ処理内でのリクエスト ID */
  id: string;
  /** カスタム ID（"notion_page_<pageId>" 形式） */
  custom_id: string;
  /** API のレスポンス情報 */
  response: {
    /** HTTP ステータスコード */
    status_code: number;
    /** レスポンスボディ */
    body: {
      /** AI の生成結果 */
      choices: Array<{
        message: {
          /** AI が生成した JSON 形式のクイズデータ */
          content: string;
        };
      }>;
    };
  };
  /** エラーが発生した場合のエラー情報 */
  error?: {
    code: string;
    message: string;
  };
}

/** バッチ処理の結果サマリー */
export interface BatchProcessResult {
  /** 成功件数 */
  succeeded: number;
  /** 失敗件数 */
  failed: number;
  /** エラー情報の配列 */
  errors: BatchError[];
}

/** エラー情報（Slack 通知用） */
export interface BatchError {
  /** エラーが発生した Notion ページ ID */
  pageId: string;
  /** エラーメッセージ */
  message: string;
}

// ---------------------------------------------------------------------------
// 新規申請 (Submission: 取得 & 送信) 用の型と定数
// ---------------------------------------------------------------------------

/** テキストの最大文字数（QuizGenerator と同じ上限） */
export const MAX_CONTENT_LENGTH = 20_000;

/** 新規申請 (Submission) 待ちの Notion ページ情報 */
export interface NotionSubmissionPage {
  /** Notion ページ ID */
  pageId: string;
  /** ページタイトル（ログ表示用） */
  title: string;
  /** Notion ページの URL プロパティ（スクレイピング対象 / source_url） */
  sourceUrl?: string;
}

/** JSONL 生成の入力として使用する中間データ */
export interface SubmissionRequestEntry {
  /** Notion ページ ID */
  pageId: string;
  /** 抽出されたテキストコンテンツ */
  content: string;
  /** source_url（Notion URL プロパティ） */
  sourceUrl?: string;
}

/** Studio (Supabase) の quiz_batch_requests テーブルの行 */
export interface StudioBatchRow {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  source_name: string;
  source_content: string;
  batch_id: string | null;
  error_message: string | null;
  created_at?: string;
  updated_at?: string;
}
