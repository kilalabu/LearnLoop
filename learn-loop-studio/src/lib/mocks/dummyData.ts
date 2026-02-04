import { Problem } from '@/features/studio/types/Problem';
import { v4 as uuidv4 } from 'uuid';

/**
 * [Web Context]: 開発初期段階では API が未実装のため、
 * このように静的なダミーデータ（Mock Data）を用意して UI 開発を進めます。
 */
export const DUMMY_PROBLEMS: Problem[] = [
  {
    id: uuidv4(),
    question: "Dockerコンテナの主要な特徴として正しいものはどれですか？",
    category: "Docker",
    options: [
      { id: uuidv4(), text: "ホストOSのカーネルを共有するため軽量である", isCorrect: true },
      { id: uuidv4(), text: "OSそのものを仮想化するため起動が遅い", isCorrect: false },
      { id: uuidv4(), text: "ハードウェアを直接制御するハイパーバイザが必要である", isCorrect: false },
      { id: uuidv4(), text: "コンテナ間でファイルシステムが完全に共有される", isCorrect: false },
    ],
    explanation: "コンテナはホストOSのカーネルを共有し、プロセスを隔離する技術です。そのため、OS全体をエミュレートする仮想マシンと比較して非常に軽量で高速に起動します。"
  },
  {
    id: uuidv4(),
    question: "OSI参照モデルの第3層（ネットワーク層）で動作するプロトコルはどれですか？",
    category: "Network",
    options: [
      { id: uuidv4(), text: "TCP", isCorrect: false },
      { id: uuidv4(), text: "HTTP", isCorrect: false },
      { id: uuidv4(), text: "IP", isCorrect: true },
      { id: uuidv4(), text: "Ethernet", isCorrect: false },
    ],
    explanation: "第3層（ネットワーク層）はデータの経路選択（ルーティング）を担当し、代表的なプロトコルには IP (Internet Protocol) があります。TCPは第4層、HTTPは第7層、Ethernetは第2層です。"
  }
];

// カテゴリに応じたダミーデータを返す関数
export const getMockProblems = (category: string): Problem[] => {
  // 実際は category に基づいてフィルタリングするなどのロジックを入れることができます
  return DUMMY_PROBLEMS;
};
