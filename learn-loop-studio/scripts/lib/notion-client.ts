// ---------------------------------------------------------------------------
// Notion API クライアント
// ---------------------------------------------------------------------------

import { Client } from '@notionhq/client';
import type {
  PageObjectResponse,
  BlockObjectResponse,
  PartialBlockObjectResponse,
  RichTextItemResponse,
  ListBlockChildrenResponse,
} from '@notionhq/client/build/src/api-endpoints';
import type { NotionBatchPage, NotionSubmissionPage } from './batch-types';

/**
 * Notion データベースとの通信を担当するクライアント
 *
 * テスト・デバッグのため、コンストラクタで依存性注入が可能。
 * デフォルトでは環境変数から自動で設定を読み込む。
 */
export class NotionClient {
  private client: Client;
  private databaseId: string;

  constructor(options?: { client?: Client; databaseId?: string }) {
    if (options?.client && options?.databaseId) {
      // DI されたインスタンスを使用（テスト用）
      this.client = options.client;
      this.databaseId = options.databaseId;
    } else {
      // 環境変数から生成（本番用）
      const token = process.env.NOTION_TOKEN;
      const databaseId = process.env.NOTION_DATABASE_ID;
      if (!token || !databaseId) {
        throw new Error('NOTION_TOKEN and NOTION_DATABASE_ID must be set');
      }
      this.client = new Client({ auth: token });
      this.databaseId = databaseId;
    }
  }

  /**
   * Status = 'InProgress' かつ Batch ID が存在するページを取得
   *
   * バッチ処理の結果を回収する対象ページの一覧を取得します。
   */
  async fetchInProgressPages(): Promise<NotionBatchPage[]> {
    console.log(`[NotionClient] Fetching InProgress pages from DB: ${this.databaseId}`);
    const response = await this.client.dataSources.query({
      data_source_id: this.databaseId,
      filter: {
        and: [
          { property: 'Status', select: { equals: 'InProgress' } },
          { property: 'Batch ID', rich_text: { is_not_empty: true } },
        ],
      },
    });

    const pages = response.results
      .filter((result): result is PageObjectResponse => result.object === 'page' && 'properties' in result)
      .map((page) => {
        const props = page.properties;
        // Batch ID の取得（rich_text 型の場合のみ値を取得）
        const batchIdProp = props['Batch ID'];
        const batchId = batchIdProp?.type === 'rich_text' ? batchIdProp.rich_text?.[0]?.plain_text ?? '' : '';
        // URL の取得（url 型の場合のみ値を取得）
        const urlProp = props['URL'];
        const sourceUrl = urlProp?.type === 'url' ? urlProp.url ?? undefined : undefined;
        return {
          pageId: page.id,
          batchId,
          sourceUrl,
        };
      });

    console.log(`[NotionClient] Found ${pages.length} InProgress pages`);
    return pages;
  }

  /**
   * Status = 'Request'と'Error'のページを取得
   *
   * @param limit - 取得上限（デフォルト 10 件）
   */
  async fetchSubmissionPages(limit: number = 10): Promise<NotionSubmissionPage[]> {
    console.log(`[NotionClient] Fetching Submission (Request) pages from DB: ${this.databaseId}`);
    const response = await this.client.dataSources.query({
      data_source_id: this.databaseId,
      filter: {
        or: [
          { property: 'Status', select: { equals: 'Request' } },
          { property: 'Status', select: { equals: 'Error' } },
        ],
      },
      page_size: limit,
    });

    const pages = response.results
      .filter((result): result is PageObjectResponse => result.object === 'page' && 'properties' in result)
      .map((page) => {
        const props = page.properties;
        // タイトルプロパティ: Notion DB のタイトル列は 'title' type
        // DB によってプロパティ名が異なるため、title type のプロパティを探す
        const titleProp = Object.values(props).find(
          (p): p is { type: 'title'; title: Array<RichTextItemResponse>; id: string } => p.type === 'title'
        );
        const title = titleProp?.title?.[0]?.plain_text ?? '(無題)';
        // URL の取得
        const urlProp = props['URL'];
        const sourceUrl = urlProp?.type === 'url' ? urlProp.url ?? undefined : undefined;

        return {
          pageId: page.id,
          title,
          sourceUrl,
        };
      });

    console.log(`[NotionClient] Found ${pages.length} Submission pages`);
    return pages;
  }

  /**
   * ページ本文のテキストを取得（blocks API）
   *
   * 1 階層のみ取得し、テキスト系ブロックの plain_text を改行区切りで結合する。
   * ページネーション対応（100 ブロック超のページにも対応）。
   */
  async getPageContent(pageId: string): Promise<string> {
    console.log(`[NotionClient] Fetching page content: ${pageId}`);
    const textParts: string[] = [];
    let cursor: string | undefined = undefined;

    do {
      const response: ListBlockChildrenResponse = await this.client.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100,
      });

      for (const block of response.results) {
        const text = this.extractBlockText(block);
        if (text) {
          textParts.push(text);
        }
      }

      cursor = response.has_more ? (response.next_cursor as string) : undefined;
    } while (cursor);

    const content = textParts.join('\n');
    console.log(`[NotionClient] Page ${pageId}: ${content.length} chars extracted`);
    return content;
  }

  /**
   * ブロックからテキストを抽出するヘルパー
   *
   * switch 文を使用して型安全に rich_text を取得します。
   */
  private extractBlockText(block: BlockObjectResponse | PartialBlockObjectResponse): string {
    if (!('type' in block)) {
      return '';
    }

    switch (block.type) {
      case 'paragraph':
        return this.getPlainText(block.paragraph.rich_text);
      case 'heading_1':
        return this.getPlainText(block.heading_1.rich_text);
      case 'heading_2':
        return this.getPlainText(block.heading_2.rich_text);
      case 'heading_3':
        return this.getPlainText(block.heading_3.rich_text);
      case 'bulleted_list_item':
        return this.getPlainText(block.bulleted_list_item.rich_text);
      case 'numbered_list_item':
        return this.getPlainText(block.numbered_list_item.rich_text);
      case 'code':
        return this.getPlainText(block.code.rich_text);
      case 'quote':
        return this.getPlainText(block.quote.rich_text);
      case 'callout':
        return this.getPlainText(block.callout.rich_text);
      case 'toggle':
        return this.getPlainText(block.toggle.rich_text);
      case 'to_do':
        return this.getPlainText(block.to_do.rich_text);
      default:
        return '';
    }
  }

  /**
   * RichTextItemResponse 配列から plain_text を結合して返す
   */
  private getPlainText(richTexts: RichTextItemResponse[]): string {
    if (!Array.isArray(richTexts) || richTexts.length === 0) {
      return '';
    }
    return richTexts.map((rt) => rt.plain_text ?? '').join('');
  }

  /**
   * ページの Status を更新
   *
   * @param pageId - Notion ページ ID
   * @param status - 'Created'（成功）, 'Error'（失敗）, 'InProgress'（処理中）
   */
  async updatePageStatus(pageId: string, status: 'Created' | 'Error' | 'InProgress'): Promise<void> {
    console.log(`[NotionClient] Updating page ${pageId} status to ${status}`);
    await this.client.pages.update({
      page_id: pageId,
      properties: { Status: { select: { name: status } } },
    });
  }

  /**
   * ページの Batch ID をクリア
   *
   * 処理完了後、次回のバッチ処理対象から除外するために Batch ID を空にします。
   */
  async clearBatchId(pageId: string): Promise<void> {
    console.log(`[NotionClient] Clearing Batch ID for page ${pageId}`);
    await this.client.pages.update({
      page_id: pageId,
      properties: { 'Batch ID': { rich_text: [] } },
    });
  }

  /**
   * ページの Error Log にメッセージを記録
   *
   * @param pageId - Notion ページ ID
   * @param message - エラーメッセージ（2000文字を超える場合は切り詰められます）
   */
  async writeErrorLog(pageId: string, message: string): Promise<void> {
    // Notion の rich_text は 2000 文字制限があるため切り詰める
    const truncated = message.length > 2000 ? message.substring(0, 2000) + '...' : message;
    console.log(`[NotionClient] Writing error log for page ${pageId}`);
    await this.client.pages.update({
      page_id: pageId,
      properties: {
        'Error Log': { rich_text: [{ type: 'text' as const, text: { content: truncated } }] },
      },
    });
  }

  /**
   * ページの Batch ID を設定する（Batch 送信後に使用）
   */
  async setBatchId(pageId: string, batchId: string): Promise<void> {
    console.log(`[NotionClient] Setting Batch ID for page ${pageId}: ${batchId}`);
    await this.client.pages.update({
      page_id: pageId,
      properties: {
        'Batch ID': { rich_text: [{ type: 'text' as const, text: { content: batchId } }] },
      },
    });
  }
}
