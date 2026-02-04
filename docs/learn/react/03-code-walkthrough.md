# 主要コードの徹底解説

実際のコードを以下の順番で読んでいくのが、最も理解しやすくおすすめです。

---

## 1. `src/features/studio/hooks/useProblemGenerator.ts`
**[まずはここから]** データの流れを理解します。

- **役割**: 問題データのリスト (`problems`) を持ち、API 呼び出し（モック）や、データの更新・削除メソッドを提供します。
- **読み解きポイント**:
  - `const [problems, setProblems] = useState<Problem[]>([]);` : これが全体の Single Source of Truth です。
  - `generateProblems`: `async/await` を使って、2秒待った後にダミーデータをセットしています。

## 2. `src/app/page.tsx`
**[全体の流れ]** 画面がどう切り替わるかを確認します。

- **役割**: `useProblemGenerator` フックを初期化し、どちらの画面を出すか制御します。
- **読み解きポイント**:
  - `problems.length === 0 ? <GenerateScreen /> : <PreviewScreen />`
  - React では Navigator を使わなくても、このように **「状態(State)によって出すコンポーネントを変える」** だけで画面遷移を表現できます。

## 3. `src/features/studio/components/GenerateScreen.tsx`
**[入力処理]**

- **役割**: カテゴリとテキスト入力を受け取り、フックの生成関数を呼びます。
- **読み解きポイント**:
  - 文字数カウント (`charCount`) やバリデーション (`isValidLength`) が、入力のたびに（再レンダリングのおかげで）自動で計算される様子を見てください。

## 4. `src/features/studio/components/ProblemCard.tsx`
**[インライン編集]** 最も詳細なロジックが詰まっています。

- **役割**: 1つの問題の表示と編集。
- **読み解きポイント**:
  - `onChange` prop: このコンポーネント自身は状態を持たず、編集されるたびに親へ「新しい問題データ」をまるごと送ります。
  - 選択肢の追加 (`addOption`) や削除 (`deleteOption`) のロジック。

## 5. `src/features/studio/components/PreviewScreen.tsx`
**[リストとアニメーション]**

- **役割**: カードを並べ、保存時のトーストなどを制御。
- **読み解きポイント**:
  - `<AnimatePresence>` と `<motion.div>`: これだけでリストの要素が消えるときにふわっと消えるアニメーションが実現されています。
