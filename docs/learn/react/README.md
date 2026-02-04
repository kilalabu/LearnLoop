# LearnLoop Studio 学習ガイド

LearnLoop Studio のコードベースへようこそ。
このガイドは、Flutter や Jetpack Compose の経験者が、React/Next.js で書かれたこのプロジェクトをスムーズに理解できるように作成されました。

## 推奨される学習ステップ

以下の順番でドキュメントを読み進めることをお勧めします。

1.  **[React vs モバイル開発の基本概念](./01-react-vs-mobile.md)**
    - React のレンダリングの仕組みやステート管理を、Flutter/Compose の概念と比較して解説します。
2.  **[プロジェクト構造の理解](./02-project-structure.md)**
    - ディレクトリ構成の意図と、どこに何が書かれているかを整理します。
3.  **[主要コードの徹底解説](./03-code-walkthrough.md)**
    - `useProblemGenerator` フックから各 UI コンポーネントまで、実装のポイントを詳しく見ていきます。
4.  **[スタイリングとアニメーション](./04-styling-animation.md)**
    - Tailwind CSS と Framer Motion を使った UI 構築の勘所を解説します。

---

## コードを読む際のヒント

- **`// [Flutter/Compose Comparison]` コメント**:
  コード内の重要な箇所には、モバイル開発の用語との対応表をコメントしています。エディタの検索機能 (`Cmd + F`) でこのキーワードを探してみてください。
- **Props は 引数**:
  React コンポーネントは関数です。引数 (`Props`) としてデータやコールバック関数を受け取ります。これは Compose の Composable 関数の引数とほぼ同じです。
- **ファイルの拡張子**:
  - `.tsx`: UI コンポーネントを含む React ファイル。
  - `.ts`: 純粋な TypeScript ロジック（フックや型定義）。
