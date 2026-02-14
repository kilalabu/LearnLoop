import { ImportQuizResponse } from '@/domain/quiz';
import { type MaxQuestions } from './quiz-generator';

const FAKE_IMPORT_RESPONSE: ImportQuizResponse = {
  topic: 'DB設計の基礎(Fake Import)',
  quizzes: [
    {
      question: '主キー(Primary Key)の設計として推奨されるのは?',
      options: [
        '意味のあるデータ(例: メールアドレス、電話番号)を主キーにする',
        '連番の整数(SERIAL/BIGSERIAL)を主キーにする',
        'UUID を主キーにする',
        'BとCは両方とも有効な選択肢で、ユースケースによる',
      ],
      answers: ['BとCは両方とも有効な選択肢で、ユースケースによる'],
      explanation: `**正解: D**\n\n| 方式 | メリット | デメリット |\n|---|---|---|\n| **SERIAL** | 小さい、ソート済み | 推測可能 |\n| **UUID** | 推測不可、分散生成OK | 大きい(16byte) |`,
      category: 'Data Storage',
    },
    {
      question: '外部キー(Foreign Key)制約を設定する目的は?',
      options: [
        'クエリのパフォーマンスを向上させる',
        '存在しないユーザーのレポートが作成されることを防ぐ(参照整合性)',
        'テーブルのサイズを小さくする',
        '自動でインデックスが作成される',
      ],
      answers: ['存在しないユーザーのレポートが作成されることを防ぐ(参照整合性)'],
      explanation: `**正解: B**\n\n外部キー制約は**参照整合性(Referential Integrity)**を保証します。`,
      category: 'Data Storage',
    },
  ],
};

/**
 * 開発・テスト用のフェイク QuizImporter。
 * USE_FAKE_AI=true のときに実際の AI 呼び出しの代わりに固定レスポンスを返す。
 */
export class FakeQuizImporter {
  async importFromText(
    _text: string,
    _modelId?: string,
    _maxQuestions?: MaxQuestions
  ): Promise<ImportQuizResponse> {
    console.log('FakeQuizImporter: importFromText called');
    console.log('Input _text length:', _text.length);
    console.log('Input _modelId:', _modelId);
    console.log('Input _maxQuestions:', _maxQuestions);
    return FAKE_IMPORT_RESPONSE;
  }
}
