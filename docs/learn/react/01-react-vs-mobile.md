# React vs モバイル開発の基本概念

Web (React) とモバイル (Flutter/Compose) は、どちらも「宣言的 UI」という共通点がありますが、いくつか決定的な違いがあります。

## 1. UI 更新の仕組み: レンダリング

React の関数コンポーネントは、**「状態が変わるたびに関数全体が再実行される」** という特徴があります。

| 概念 | React | Flutter | Jetpack Compose |
| :--- | :--- | :--- | :--- |
| **UIの再描画** | Rendering | Rebuild | Recomposition |
| **更新の単位** | 関数コンポーネント全体 | Widget Tree の特定範囲 | Composable 関数の再実行 |

- **注意点**: React では関数が再実行されるため、関数内で定義したローカル変数は毎回リセットされます。値を保持したい場合は `useState` を使います。

## 2. 状態管理 (State Management)

React の `useState` は、値を保存し、その値が変わったときに自動で UI を再描画（Re-render）させるための仕組みです。

```tsx
// React
const [count, setCount] = useState(0);

// Flutter
// ValueNotifier<int> count = ValueNotifier(0);

// Compose
// var count by remember { mutableStateOf(0) }
```

## 3. 副作用とライフサイクル (Side Effects)

API 呼び出しやタイマーの開始など、描画以外の処理を行うには `useEffect` を使います。

```tsx
useEffect(() => {
  // マウント時に実行 (initState 相当)
  console.log("Mounted");

  return () => {
    // アンマウント時に実行 (dispose 相当)
    console.log("Will Unmount");
  };
}, []); // この空配列 [] は「初回のみ実行」を意味します
```

## 4. リストレンダリング

React には `ListView.builder` のようなクラスはなく、標準の JavaScript 配列メソッド `.map()` を使ってコンポーネントの配列を生成します。

```tsx
// 配列をループして UI を生成
{items.map((item) => (
  <ItemCard key={item.id} data={item} />
))}
```
- **重要**: 各要素には必ずユニークな `key` プロパティを渡す必要があります。これは React がリストのどの要素が変わったかを効率的に判断するために必要です。
