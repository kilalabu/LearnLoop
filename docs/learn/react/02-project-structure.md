# プロジェクト構造の理解

LearnLoop Studio では、機能ごとにまとめる **Feature-based** な構造を採用しています。これにより、特定の機能に関連するコードを一箇所で把握しやすくなっています。

## `src/features/studio` (中核機能)

ここがプロジェクトの心臓部です。

1.  **`/types/Problem.ts` (Model)**
    - データの「形」を定義する場所。インターフェースや型定義が置かれます。
    - **モバイル視点**: Entity や Data Class に相当。
2.  **`/hooks/useProblemGenerator.ts` (ViewModel/Logic)**
    - UI 以外のビジネスロジック、状態保持を隠蔽する「カスタムフック」。
    - **モバイル視点**: `ViewModel` や `ChangeNotifier` に相当。UI コンポーネントはこのフックを呼ぶだけでデータ操作が完結します。
3.  **`/components/` (Views)**
    - UI パーツ。`GenerateScreen` (入力), `PreviewScreen` (リスト), `ProblemCard` (個々のパーツ) に分割。
    - **モバイル視点**: `StatelessWidget` や `Composable` 関数に相当。

## その他の重要なディレクトリ

- **`src/app/`**:
  - Next.js のルーティング。`page.tsx` が「画面」としてのエントリポイントになります。
  - 今回は「条件付きレンダリング」を使って、1つのページ内で生成画面とプレビュー画面を切り替えています。
- **`src/components/ui/`**:
  - `shadcn/ui` で生成された、再利用性の高い基本パーツ（Button, Input等）。
- **`src/lib/`**:
  - `mocks/`: API がない状態でも開発できるようにするためのダミーデータ。
  - `utils.ts`: Tailwind CSS のクラス結合などのユーティリティ。

## なぜこの構成なのか？

React ではコンポーネントが肥大化しやすいため、**「データ(Types)」「ロジック(Hooks)」「表示(Components)」** を明確に分けることで、以下のメリットがあります：
- テストがしやすくなる。
- モバイルエンジニアが `hooks` を `ViewModel` 的な感覚で読み解ける。
- UI の変更がロジックに影響を与えにくい。
