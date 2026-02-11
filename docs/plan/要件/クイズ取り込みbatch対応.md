# 要件定義: Studio クイズ生成の Batch API 対応と複数ファイル取り込み

## 1. 概要
Learn Loop Studio の「Markdown 取り込み」機能において、OpenAI Batch API を利用した非同期生成を可能にする。あわせて複数ファイルの一括アップロードに対応する。
実装のシンプルさを重視し、Web API 側では「DB 保存」のみを行い、実際の OpenAI との通信は夜間のスクリプトに一任する。
現在 Notion用に実装されている `batch-processor.ts` を拡張・リファクタリングし、Studio（Supabase）からのクイズ生成リクエストも OpenAI Batch API で処理できるようにする。将来的なデータソースの追加にも耐えられるよう、Interfaceを用いて責務を分離する。

## 2. 対象スコープ
- **Markdown 取り込み**: 同期生成 / Batch 生成を選択可能。複数ファイル対応。
- テキスト入力 / URL 抽出: 変更なし（常に同期生成）。

## 3. UI/UX 要件
- **複数ファイル対応**: ファイル入力を `multiple` に変更。
- **生成モード選択**: Markdown タブのみ「Batch 生成（デフォルト/翌日完了）」と「即時生成」の選択 UI を追加。
- **フィードバック**: Batch 選択時は「生成予約完了」のメッセージを表示し、翌日にクイズ一覧へ反映される旨を伝える。

## 4. データモデル (Supabase)
Batch リクエストの永続化のため、以下のテーブルを管理する。

**Table: `quiz_generations`**
- `id`: uuid (PK)
- `user_id`: uuid
- `status`: text ('pending', 'processing', 'completed', 'failed')
- `source_name`: text (ファイル名)
- `source_content`: text (Markdown 全文。2万文字程度を想定)
- `batch_id`: text (OpenAI から発行される Batch ID)
- `created_at / updated_at`: timestamp

## 5. 処理フロー
### 5.1. 予約フェーズ (Next.js API)
- ユーザーが Batch モードで実行した際、各ファイルの情報を `quiz_generations` に `status: 'pending'` で保存して終了する。※ここでは OpenAI API は叩かない。

### 5.2. 実行フェーズ (GitHub Actions / scripts)
- **StudioBatchProvider** (新規作成) が以下を順次実行：
    1. **送信処理**: `pending` なレコードを全件取得し、1つの JSONL ファイルにまとめて OpenAI Batch API に送信。ステータスを `processing` に更新し、`batch_id` を保存。
    2. **結果取得処理**: `processing` 状態のレコードの `batch_id` を確認。完了していれば結果をダウンロードし、クイズを `quizzes` テーブル等へ保存。ステータスを `completed` に更新。

## 6. 指示
1. `quiz_generations` テーブル作成の SQL を準備してください。過去のSQLはlearn-loop-studio/src/lib/supabase/sql_queryにあります。
2. `scripts/batch/providers/studio-provider.ts` を作成し、DB からの読み取り・送信・結果保存のロジックを実装してください。
3. `learn-loop-studio/src/app/api/quiz/register-batch/route.ts` を作成し、DB 保存ロジックを実装してください。
4. フロントエンド UI を改修し、複数ファイル選択と Batch/即時モードの切り替え、および `/api/quiz/register-batch` へのリクエスト処理を実装してください。


## 7. 設計案
**下記はあくまで案です。より良い設計・実装方針・命名などがあれば、積極的に提案してください**

設計方針：Provider パターンの導入
「OpenAI Batch API との通信」という共通のコアロジックと、「NotionやSupabaseとの読み書き」という個別ロジックを明確に分離します。

1. 登場人物と責務
BatchProcessor (Core):

オーケストレーターです。登録された Provider リストを順に呼び出します。

OpenAIへのファイルアップロード、バッチ作成、ステータス確認、結果ダウンロードを担当します。

NotionやSupabaseのことは一切知りません。

BatchProvider (Interface):

すべてのデータソースが守るべき契約（インターフェース）です。

「未処理データの取得」「リクエスト行の作成」「結果の保存」を定義します。

NotionBatchProvider (Impl):

Notion DBから未処理ページを探し、Notion用プロンプトを作り、結果をNotionに書き戻すクラスです。

StudioBatchProvider (Impl):

Supabaseから未処理レコードを探し、Markdownをパースしてプロンプトを作り、結果をSupabaseに保存するクラスです。

2. ディレクトリ構成案
既存の scripts フォルダ内を整理します。

Plaintext
scripts/
  ├── batch/
  │   ├── core/
  │   │   ├── batch-processor.ts    # メインループ処理
  │   │   └── openai-client.ts      # OpenAI APIラッパー
  │   ├── providers/
  │   │   ├── base-provider.ts      # インターフェース定義
  │   │   ├── notion-provider.ts    # Notion用実装
  │   │   └── studio-provider.ts    # Studio(Supabase)用実装
  │   └── index.ts                  # エントリーポイント
3. 実装イメージ
A. インターフェース定義 (base-provider.ts)
共通の契約を定義します。Generics (T) を使うことで、各プロバイダーが扱う内部データ（Notion Page オブジェクトや Supabase Row）の型安全性を保てます。

TypeScript
// scripts/batch/providers/base-provider.ts

export interface BatchRequestItem {
  custom_id: string; // "source:id" 形式（例: "notion:123", "studio:456"）
  body: any;         // OpenAIへのリクエストボディ
}

export interface BatchProvider<T = any> {
  /** プロバイダー名（ログ用） */
  readonly name: string;

  /** 1. 未処理のアイテムを取得する */
  fetchPendingItems(): Promise<T[]>;

  /** 2. アイテムをOpenAI Batch API用の行データに変換する */
  createRequestItem(item: T): Promise<BatchRequestItem>;

  /** 3. バッチ投入完了時にIDを保存する（NotionプロパティやDB更新） */
  markAsProcessing(items: T[], batchId: string): Promise<void>;

  /** 4. 実行中のバッチIDリストを取得する */
  fetchActiveBatchIds(): Promise<string[]>;

  /** 5. 完了したバッチの結果を処理・保存する */
  handleBatchCompletion(batchId: string, results: Map<string, any>): Promise<void>;
  
  /** オプション: 失敗時の処理 */
  handleBatchFailure?(batchId: string, error: any): Promise<void>;
}
B. Studio用プロバイダーの実装 (studio-provider.ts)
ここにStudio固有のロジック（Markdownパース、Supabase操作）を閉じ込めます。Notion側の事情を気にする必要はありません。

TypeScript
// scripts/batch/providers/studio-provider.ts
import { BatchProvider, BatchRequestItem } from './base-provider';
import { createClient } from '@supabase/supabase-js';

export class StudioBatchProvider implements BatchProvider<any> {
  readonly name = 'Studio(Supabase)';
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

  async fetchPendingItems() {
    // Supabaseから status='pending' のレコードを取得
    const { data } = await this.supabase
      .from('quiz_generations')
      .select('*')
      .eq('status', 'pending');
    return data || [];
  }

  async createRequestItem(record: any): Promise<BatchRequestItem> {
    // Markdownファイルの中身を読み込む（Storageにある場合など）
    const markdownContent = await this.downloadMarkdown(record.source_path);
    
    // プロンプト作成
    const prompt = `以下のMarkdown教材からクイズを作成して...\n\n${markdownContent}`;

    return {
      custom_id: `studio:${record.id}`, // prefixをつけるのがコツ
      body: {
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        // ...
      }
    };
  }

  async markAsProcessing(records: any[], batchId: string) {
    // Supabaseのステータスを更新
    const ids = records.map(r => r.id);
    await this.supabase
      .from('quiz_generations')
      .update({ status: 'processing', batch_id: batchId })
      .in('id', ids);
  }

  // ... 他のメソッドも同様にSupabase操作を実装
}
C. メインプロセッサ (batch-processor.ts)
ここは「プロバイダー」を抽象的に扱うため、プロバイダーが増えてもコード修正がほぼ不要になります。

TypeScript
// scripts/batch/core/batch-processor.ts
import { BatchProvider } from '../providers/base-provider';
import { OpenAIBatchClient } from './openai-client';

export class BatchProcessor {
  constructor(
    private openai: OpenAIBatchClient,
    private providers: BatchProvider[]
  ) {}

  async run() {
    console.log('Starting daily batch process...');

    for (const provider of this.providers) {
      try {
        await this.processProvider(provider);
      } catch (e) {
        console.error(`Error in provider ${provider.name}:`, e);
        // 1つのプロバイダーが失敗しても他は止めない
      }
    }
  }

  private async processProvider(provider: BatchProvider) {
    // 1. 新規バッチの投入
    const items = await provider.fetchPendingItems();
    if (items.length > 0) {
      console.log(`${provider.name}: Found ${items.length} pending items.`);
      const requests = await Promise.all(items.map(i => provider.createRequestItem(i)));
      
      // JSONL作成 & アップロード & バッチ作成
      const fileId = await this.openai.uploadFile(requests);
      const batchId = await this.openai.createBatch(fileId);
      
      await provider.markAsProcessing(items, batchId);
      console.log(`${provider.name}: Batch created (${batchId})`);
    }

    // 2. 実行中バッチの確認
    const activeBatchIds = await provider.fetchActiveBatchIds();
    for (const batchId of activeBatchIds) {
      const status = await this.openai.retrieveBatch(batchId);
      
      if (status.status === 'completed' && status.output_file_id) {
        console.log(`${provider.name}: Batch ${batchId} completed. Downloading results...`);
        const results = await this.openai.downloadResults(status.output_file_id);
        await provider.handleBatchCompletion(batchId, results);
      } else if (status.status === 'failed') {
         // 失敗処理
      }
    }
  }
}
D. エントリーポイント (index.ts)
GitHub Actionsからはこのファイルを呼び出します。

TypeScript
// scripts/batch/index.ts
import { BatchProcessor } from './core/batch-processor';
import { OpenAIBatchClient } from './core/openai-client';
import { NotionBatchProvider } from './providers/notion-provider';
import { StudioBatchProvider } from './providers/studio-provider';

async function main() {
  const openai = new OpenAIBatchClient();
  
  // ここに使いたいプロバイダーを登録するだけ
  const processor = new BatchProcessor(openai, [
    new NotionBatchProvider(),
    new StudioBatchProvider()
  ]);

  await processor.run();
}

main().catch(console.error);

この設計のメリット
影響範囲の限定: Studio側の仕様変更（例: DBスキーマ変更）があっても、StudioBatchProvider だけを修正すれば良く、Notion側のコードを壊す心配がありません。

拡張性: 将来「Google DriveのPDFから生成したい」となっても、DriveBatchProvider を追加してリストに加えるだけで済みます。

エラー隔離: try-catch をプロバイダー単位で行うことで、Notion APIがダウンしていても、Studio分のバッチは正常に動作します。

テスト容易性: BatchProvider インターフェースをモックすれば、OpenAI APIを実際に叩かずに単体テストが可能です。
