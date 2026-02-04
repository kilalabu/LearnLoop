# スタイリングとアニメーション

LearnLoop Studio では、Web 制作における最新のベストプラクティスを組み合わせています。

## 1. Tailwind CSS v4

CSS ファイルに直接スタイルを書く代わりに、HTML クラス名 (`className`) に直接スタイルを記述します。

```tsx
<div className="bg-primary text-white p-4 rounded-xl shadow-lg">...</div>
```

- **CSS変数**: `globals.css` で `oklch` (最新のカラー指定形式) を使って色を定義しています。`bg-primary` はその変数を参照します。
- **レスポンシブ**: `hidden sm:flex` という記述は、「通常は非表示だが、タブレット/PCサイズなら flex にする」という意味です。

## 2. Framer Motion

React で最も人気のあるアニメーションライブラリです。

- **`layout` プロパティ**:
  リストの要素が削除されたとき、残りの要素がスムーズに上に詰まる動きは、`<motion.div layout>` と書くだけで自動計算されます。
- **`AnimatePresence`**:
  コンポーネントが DOM から消えるとき（条件分岐やリスト削除）のアニメーションを可能にします。

## 3. shadcn/ui (Radix UI)

`src/components/ui/` にあるコンポーネントです。

- これらは「ライブラリ」ではなく「コードの雛形」を自分のプロジェクトにコピーしたものです。
- Radix UI というアクセシビリティ（キーボード操作やスクリーンリーダー対応）が保証された低レイヤーなライブラリをベースに、Tailwind で装飾されています。
- `Button.tsx` や `Card.tsx` を開いてみると、ただの React コンポーネントであることがわかります。
