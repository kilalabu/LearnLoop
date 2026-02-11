// ---------------------------------------------------------------------------
// OpenAI Batch API クライアント
// ---------------------------------------------------------------------------

import OpenAI from 'openai';
import type { BatchOutputLine } from './batch-types';

/**
 * OpenAI Batch API のステータス
 *
 * - completed: 処理完了（結果ファイル取得可能）
 * - failed: バッチ処理失敗
 * - expired: 期限切れ
 * - cancelled: キャンセル済み
 * - in_progress: 処理中
 * - validating: バリデーション中
 * - finalizing: 最終処理中
 * - cancelling: キャンセル処理中
 */
export type BatchStatus =
  | 'completed'
  | 'failed'
  | 'expired'
  | 'cancelled'
  | 'in_progress'
  | 'validating'
  | 'finalizing'
  | 'cancelling';

/** Batch ステータスチェックの結果 */
export interface BatchCheckResult {
  /** 現在のバッチステータス */
  status: BatchStatus;
  /** 処理完了時の出力ファイル ID */
  outputFileId?: string;
  /** 失敗時のエラーメッセージ */
  errorMessage?: string;
}

/**
 * OpenAI Batch API との通信を担当するクライアント
 *
 * テスト・デバッグのため、コンストラクタで依存性注入が可能。
 * デフォルトでは環境変数 OPENAI_API_KEY から自動で認証情報を読み込む。
 */
export class OpenAIBatchClient {
  private client: OpenAI;

  constructor(client?: OpenAI) {
    // DI 可能。デフォルトは環境変数 OPENAI_API_KEY を自動で読む
    this.client = client ?? new OpenAI();
  }

  /**
   * Batch のステータスを取得
   *
   * @param batchId - OpenAI Batch API のバッチ ID
   * @returns ステータス情報（completed の場合は出力ファイル ID も含む）
   */
  async checkBatchStatus(batchId: string): Promise<BatchCheckResult> {
    console.log(`[OpenAIBatch] Checking batch status: ${batchId}`);
    const batch = await this.client.batches.retrieve(batchId);

    const result: BatchCheckResult = {
      status: batch.status as BatchStatus,
    };

    if (batch.status === 'completed' && batch.output_file_id) {
      result.outputFileId = batch.output_file_id;
    }

    if (batch.status === 'failed') {
      // エラー情報が存在する場合はメッセージを抽出
      const errorMessages = batch.errors?.data
        ?.map((e) => `${e.code}: ${e.message}`)
        .join('; ');
      result.errorMessage = errorMessages || 'Unknown error';
    }

    console.log(`[OpenAIBatch] Batch ${batchId}: status=${result.status}`);
    return result;
  }

  /**
   * 出力ファイルをダウンロードし、JSONL をパースして返す
   *
   * @param fileId - OpenAI Files API のファイル ID
   * @returns パース済みのバッチ出力行の配列
   */
  async downloadOutputFile(fileId: string): Promise<BatchOutputLine[]> {
    console.log(`[OpenAIBatch] Downloading output file: ${fileId}`);
    const response = await this.client.files.content(fileId);
    const text = await response.text();

    // JSONL 形式（1行1JSON）をパース
    const lines = text
      .trim()
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line) as BatchOutputLine);

    console.log(`[OpenAIBatch] Parsed ${lines.length} output lines`);
    return lines;
  }

  /**
   * JSONL コンテンツを OpenAI Files API にアップロード
   *
   * @param content - JSONL 形式の文字列
   * @returns アップロードされたファイルの ID
   */
  async uploadSubmissionFile(content: string): Promise<string> {
    console.log(`[OpenAIBatch] Uploading JSONL file (${content.length} chars)`);

    // OpenAI SDK v4+ は File オブジェクトを受け付ける
    // 注意: node 20+ のグローバル File を使用
    const file = new File([content], 'batch-input.jsonl', { type: 'application/jsonl' });
    const uploaded = await this.client.files.create({
      file,
      purpose: 'batch',
    });

    console.log(`[OpenAIBatch] File uploaded: ${uploaded.id}`);
    return uploaded.id;
  }

  /**
   * Batch リクエストを送信し、Batch ID を返す
   *
   * @param inputFileId - アップロード済み JSONL ファイルの ID
   * @returns OpenAI Batch API のバッチ ID
   */
  async submitBatch(inputFileId: string): Promise<string> {
    console.log(`[OpenAIBatch] Creating batch with input file: ${inputFileId}`);
    const batch = await this.client.batches.create({
      input_file_id: inputFileId,
      endpoint: '/v1/chat/completions',
      completion_window: '24h',
    });

    console.log(`[OpenAIBatch] Batch created: ${batch.id} (status: ${batch.status})`);
    return batch.id;
  }
}
