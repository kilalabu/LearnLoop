# AI問題作成オートメーションシステム 要件定義書

## 1. プロジェクト概要
Notion、Web(React)、モバイル(Flutter)の3動線から、URLおよびテキスト情報をインプットとしてAI（LLM）が「問題・回答・解説」を自動生成する。
開発はフェーズを分けて行い、まずはWebでの即時生成を確立し、次にNotion連携によるバッチ処理を実装する。

---

## 2. フェーズ定義

### フェーズ1: Web特化 (即時生成)
Webアプリケーション(Next.js)上でのURL/テキスト入力による即時問題生成機能を実装する。
ユーザー体験を優先し、Standard APIを用いたリアルタイム性を重視する。

### フェーズ2: Notion同期 & Batch API対応 (非同期生成)
Notionデータベースとの連携およびOpenAI/AnthropicのBatch APIを用いた大量・低コスト生成を実現する。

---

## 3. システム構成
### インフラ・技術スタック
- **Framework**: Next.js (App Router), Vercel
- **Database / Auth**: Supabase
- **AI SDK**: Vercel AI SDK
- **AI Models**: 
    - **OpenAI**: GPT-4o mini (Batch API対応)
    - **Anthropic**: Claude 4.5 Sonnet (Prompt Caching / Message Batches対応)

---

## 4. 機能要件

### A. フェーズ1: Web (Next.js) / Mobile (Flutter) - 即時生成
1. **ユーザーインターフェース**:
   - URL入力フォームまたはテキストエリアへのペースト機能。
   - 生成ボタン押下で **Standard API** を呼び出し、即座に生成結果をプレビュー。
2. **コンテンツ抽出 (Node.js)**:
   - **URLスクレイピング**: `cheerio` 等を用い、指定URLからメインテキスト（記事本文など）のみをクリーンに抽出。
3. **プロンプト設計**:
   - AIの精度を高めるため、マークダウン形式の共通システムプロンプトを定義。

### B. フェーズ2: Notion同期 - 非同期/バッチ生成
1. **Notion同期 (Cron)**: 
   - 特定DBの「問題作成」ステータスを検知。URLプロパティまたは添付テキストファイルから内容を抽出。
2. **Batch API利用**:
   - **Batch API** を利用し、低コストで非同期生成。
3. **Prompt Caching**:
   - 生成ルールやJSONフォーマットを含む**共通システムプロンプトをキャッシュ**。
   - [推論]: プロンプトを固定しキャッシュを効かせることで、APIリクエストのたびに発生する「命令部分のトークン料金」を**排除する (Eliminates)** ことができます。

---

## 5. 運用コストとセキュリティ
- **コスト**: Batch API利用によりNotion同期分は50%オフ。Prompt Cachingにより全体リクエストの入力トークン代を最大90%削減（フェーズ2で最大化）。
- **セキュリティ**: Supabase RLSにより、認証ユーザーのみが自身の問題データを操作できるよう**確実に保護する (Ensures that)**。

---

## 6. 実装ロードマップ

### フェーズ1: Web特化
 [ ] **Scraper実装**: URLからクリーンなテキストを抽出するユーティリティ作成。
 [ ] **AI Client構築**: 基本的なプロンプト設計とAPI連携 (Standard API)。
 [ ] **API/UI構築**: Web/Flutterから即時生成を行うためのエンドポイントの実装。

### フェーズ1.5: Web,Mobileとの繋ぎこみ
 [ ] 問題作成できるようにする。

### フェーズ2: Notion同期
 [ ] **Batch生成フロー**: Notion監視からBatch API投入、結果回収のサイクルを実装。
 [ ] **Prompt Caching最適化**: 共通プロンプトのキャッシュ化によるコスト削減。
