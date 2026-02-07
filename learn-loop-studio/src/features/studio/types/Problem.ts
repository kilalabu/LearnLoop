export type ProblemCategory = 'Docker' | 'Network' | 'English' | string;

/** DB の source_type カラムに対応。'text' はフロント入力時の値で、DB保存時に 'manual' へマッピングされる */
export type SourceType = 'text' | 'url' | 'manual';

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
  sourceType: SourceType;
  sourceUrl?: string; // sourceType === 'url' の場合のみ設定
}

/**
 * [Flutter/Compose Comparison]:
 * このインターフェースは Flutter の Data Class や Kotlin の data class に相当します。
 * TypeScript では interface を使うことで、オブジェクトの構造を定義し、
 * 型安全な開発（コンパイル時のチェック）を可能にします。
 */
