# LearnLoop Studio

LearnLoop Studio は、学習テキストから AI を用いて「選択式クイズ」を自動生成し、内容の校正・管理を行うためのツールです。

## 概要

このプロジェクトは、Next.js (App Router) を使用して構築されたフロントエンドプロトタイプです。AI による問題生成プロセスをシミュレーションし、直感的なインライン編集インターフェースを提供します。

## 主な機能

- **問題生成 (Generate Screen)**: 学習テキスト（Markdown対応）とカテゴリを入力し、AIによるクイズ生成を開始。
- **プレビュー・編集 (Preview Screen)**: 生成された問題をリスト形式で確認。問題文、選択肢、解説をその場で編集可能。
- **直感的な操作**: 選択肢の追加・削除、正答の簡単な切り替え、Framer Motion によるスムーズなアニメーション。
- **Flutter/Compose エンジニア向け設計**: Web開発初心者でも理解しやすいよう、コード内に詳細な比較注釈（useState ↔ mutableStateOf 等）を付与。

## アーキテクチャと開発ルール

今後の開発における統一感を保つため、以下のルールを遵守してください。

### 1. ディレクトリ構成 (Feature-based)

機能ごとにディレクトリを分割する **Feature-based** アーキテクチャを採用しています。

- **`src/features/<feature-name>/`**: 
  - 特定の機能ドメインに関するすべてのコード（コンポーネント、フック、型）をここに格納します。
  - 今回のメイン機能は `src/features/studio` に集約しています。
- **`src/components/ui/`**: 
  - プロジェクト全体で共有される汎用UIコンポーネント（ボタン、カード、入力フォームなど）。
  - 基本的に `shadcn/ui` で生成されたものがここに入ります。
- **`src/lib/`**: 
  - ユーティリティ、モックデータ、APIクライアントなどの共有ロジック。

```text
src/
├── app/                  # Next.js App Router (ページ定義)
├── features/
│   └── studio/           # 問題生成機能 (Studio)
│       ├── components/   # GenerateScreen, PreviewScreen, ProblemCard
│       ├── hooks/        # ビジネスロジック (useProblemGenerator)
│       └── types/        # 型定義 (Problem)
├── components/ui/        # 共通UI (shadcn/ui)
└── lib/                  # ユーティリティ
```

### 2. コーディング規約 (Flutter/Compose エンジニア向け)

Web開発の経験が浅いメンバーもメンテナンスしやすいよう、以下のルールを設けています。

- **詳細な日本語コメント**:
  - ビジネスロジックや複雑な処理には必ず日本語でコメントを記述します。
  - コードが「何をしているか」だけでなく、「なぜそうしているか」を記述してください。
- **対比コメントの付与**:
  - React特有のフックやパターンが登場する際は、Flutter/Compose の概念と比較するコメントを追加してください。
  - 例: `// [Compose Comparison]: remember { mutableStateOf(...) } に相当`

### 3. ステート管理 (Custom Hooks)

- **ロジックの分離**:
  - コンポーネント (`.tsx`) 内に直接複雑なロジックを書かず、必ず **Custom Hook** に切り出してください。
  - 例: 生成ロジックや状態保持は `GenerateScreen.tsx` ではなく `hooks/useProblemGenerator.ts` に実装されています。
- **UIは表示に専念**:
  - UIコンポーネントは `props` を受け取って表示するだけの「ステートレス」に近い形を保つことを推奨します。

### 4. デザインシステム

- **Tailwind CSS & shadcn/ui**:
  - スタイリングは Tailwind CSS を使用し、配色は `globals.css` の CSS変数 (`var(--primary)` 等) を使用してください。
  - 新しいコンポーネントが必要な場合は、まず `shadcn` コマンドで追加できるか検討してください。

## 技術スタック

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev)

## はじめかた

### 環境変数の設定

API キーが必要です。

1. `learn-loop-studio/.env.local` ファイルを作成します。
2. 以下の内容を記述し、自分の API キーを設定してください。

```env
GOOGLE_GENERATIVE_AI_API_KEY=xxxxxxxxxx
OPENAI_API_KEY=xxxxxxxxxx
ANTHROPIC_API_KEY=xxxxxxxxxx

# trueにするとAI APIを呼ばずにダミーデータを返す
USE_FAKE_AI=true
```

### 開発サーバーの起動

依存関係をインストールしてから開発サーバーを起動します。

```bash
# プロジェクトディレクトリへ移動
cd learn-loop-studio

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと結果が表示されます。

## ライセンス

このプロジェクトは私的な利用およびプロトタイプ開発を目的としています。
