export type ProblemCategory = 'Docker' | 'Network' | 'English' | string;

export interface Option {
  id: string; // [Web Context]: ユニークなID。UUID v4などを想定
  text: string;
  isCorrect: boolean;
}

export interface Problem {
  id: string;
  question: string; // Markdown形式のテキストを想定
  options: Option[];
  explanation: string;
  category: ProblemCategory;
}

/**
 * [Flutter/Compose Comparison]:
 * このインターフェースは Flutter の Data Class や Kotlin の data class に相当します。
 * TypeScript では interface を使うことで、オブジェクトの構造を定義し、
 * 型安全な開発（コンパイル時のチェック）を可能にします。
 */
