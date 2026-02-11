// scripts/batch/providers/base-provider.ts

/** OpenAI Batch API 用のリクエスト行データ */
export interface BatchRequestItem {
  custom_id: string; // 一意の識別子（例: "notion:page_123", "studio:req_456"）
  body: any;         // OpenAI Chat Completion API のリクエストボディ
}

/**
 * すべてのデータソース（Notion, Supabase等）が守るべきインターフェース。
 * T は各プロバイダーが内部で扱うデータの型（Notion Page, DB Row 等）。
 */
export interface BatchProvider<T = any> {
  /** プロバイダー名（ログ・通知用） */
  readonly name: string;

  /** 1. 未処理のアイテムを取得する（例: status='pending'） */
  fetchPendingItems(): Promise<T[]>;

  /** 2. 各アイテムを OpenAI Batch API 用のリクエスト行に変換する */
  createRequestItem(item: T): Promise<BatchRequestItem>;

  /** 3. バッチ送信完了時にアイテムのステータスを更新する（例: status='processing', batch_id='...'） */
  markAsProcessing(items: T[], batchId: string): Promise<void>;

  /** 4. 現在実行中（結果回収待ち）のバッチIDリストを取得する */
  fetchActiveBatchIds(): Promise<string[]>;

  /** 5. 完了したバッチの結果をパースして保存し、アイテムのステータスを更新する */
  handleBatchCompletion(batchId: string, results: Map<string, any>): Promise<void>;

  /** 6. バッチ自体が失敗（failed, expired 等）した場合の事後処理（オプション） */
  handleBatchFailure?(batchId: string, errorMessage: string): Promise<void>;
}
