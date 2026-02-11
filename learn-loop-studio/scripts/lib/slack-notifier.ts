// ---------------------------------------------------------------------------
// Slack 通知クライアント
// ---------------------------------------------------------------------------

import type { BatchError } from './batch-types';

/**
 * Slack への通知を担当するクライアント
 *
 * テスト・デバッグのため、コンストラクタで Webhook URL の依存性注入が可能。
 * Webhook URL が未設定の場合は、通知をコンソールに出力します（開発環境用）。
 */
export class SlackNotifier {
  private webhookUrl: string | undefined;

  constructor(webhookUrl?: string) {
    // DI 可能。デフォルトは環境変数から読む
    this.webhookUrl = webhookUrl ?? process.env.SLACK_WEBHOOK_URL;
  }

  /**
   * バッチ処理のエラーを Slack に通知
   *
   * @param errors - エラー情報の配列
   */
  async notifyErrors(errors: BatchError[]): Promise<void> {
    if (errors.length === 0) return;

    const errorList = errors
      .map((e) => `• Page \`${e.pageId}\`: ${e.message}`)
      .join('\n');

    const text = `:warning: *Notion Batch 処理エラー*\n${errors.length} 件のエラーが発生しました:\n${errorList}`;
    await this.send(text);
  }

  /**
   * スクリプトレベルの致命的エラーを通知
   *
   * @param error - キャッチされた Error オブジェクト
   */
  async notifyFatalError(error: Error): Promise<void> {
    const text = `:rotating_light: *Notion Batch 致命的エラー*\nスクリプトが異常終了しました:\n\`\`\`${error.message}\`\`\``;
    await this.send(text);
  }

  /**
   * メッセージ送信（Webhook URL 未設定時はコンソールフォールバック）
   *
   * 本番環境では Slack に POST し、開発環境ではコンソール出力します。
   */
  private async send(text: string): Promise<void> {
    if (!this.webhookUrl) {
      console.warn('[SlackNotifier] SLACK_WEBHOOK_URL 未設定。コンソール出力:');
      console.warn(text);
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.error(`[SlackNotifier] 通知失敗: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('[SlackNotifier] 通知送信エラー:', err);
    }
  }
}
