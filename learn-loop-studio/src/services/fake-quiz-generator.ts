import { GeneratedQuizResponse } from '@/domain/quiz';

const FAKE_RESPONSE: GeneratedQuizResponse = {
  topic: 'Docker & REST API の基礎（Fake）',
  quizzes: [
    {
      question: 'Dockerコンテナの主要な特徴として正しいものはどれですか？',
      options: [
        'ホストOSのカーネルを共有するため軽量である',
        'OSそのものを仮想化するため起動が遅い',
        'ハードウェアを直接制御するハイパーバイザが必要である',
        'コンテナ間でファイルシステムが完全に共有される',
      ],
      answers: ['ホストOSのカーネルを共有するため軽量である'],
      explanation: `## コンテナ vs 仮想マシン

コンテナはホストOSの**カーネルを共有**し、プロセスを隔離する技術です。

| 項目 | コンテナ | 仮想マシン |
|------|---------|-----------|
| カーネル | ホストと**共有** | ゲストOS独自 |
| 起動速度 | **数秒** | 数分 |
| リソース消費 | 少ない | 多い |

\`\`\`dockerfile
# 例: 軽量なコンテナイメージ
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "index.js"]
\`\`\`

> **よくある誤解**: 「コンテナ間でファイルシステムが共有される」と思われがちですが、各コンテナは**独立したファイルシステム**を持ちます。共有が必要な場合は \`volume\` を明示的に設定します。`,
    },
    {
      question: 'RESTful APIにおいて、リソースの新規作成に最も適切なHTTPメソッドはどれですか？',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      answers: ['POST'],
      explanation: `## HTTPメソッドとCRUD操作の対応

RESTful API では、各HTTPメソッドが**CRUD操作**に対応します。

| メソッド | CRUD | 冪等性 | 用途 |
|---------|------|--------|------|
| GET | Read | **冪等** | リソースの取得 |
| **POST** | **Create** | 非冪等 | **リソースの新規作成** |
| PUT | Update | **冪等** | リソースの全体置換 |
| DELETE | Delete | **冪等** | リソースの削除 |

\`\`\`ts
// POST でリソースを新規作成する例
const res = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Taro' }),
});
\`\`\`

> **PUTとの違い**: \`PUT\` はリソースの**全体を置き換える**操作であり、同じリクエストを何度送っても結果が同じ（**冪等**）です。一方 \`POST\` は呼び出すたびに新しいリソースが作られます。`,
    },
  ],
};

export class FakeQuizGenerator {
  async generateQuizFromText(
    _text: string,
    _modelId?: string,
    _maxQuestions?: 'default' | 'unlimited' | number
  ): Promise<GeneratedQuizResponse> {
    console.log('FakeQuizGenerator: generateQuizFromText called');
    console.log('Input _text:', _text);
    console.log('Input _modelId:', _modelId);
    console.log('Input _maxQuestions:', _maxQuestions);
    return FAKE_RESPONSE;
  }

  async generateQuizFromUrl(
    _url: string,
    _modelId?: string,
    _maxQuestions?: 'default' | 'unlimited' | number
  ): Promise<GeneratedQuizResponse> {
    console.log('FakeQuizGenerator: generateQuizFromUrl called');
    console.log('Input _url:', _url);
    console.log('Input _modelId:', _modelId);
    console.log('Input _maxQuestions:', _maxQuestions);
    return FAKE_RESPONSE;
  }
}
