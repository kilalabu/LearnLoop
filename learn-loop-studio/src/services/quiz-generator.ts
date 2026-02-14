import { generateText, Output } from 'ai';
import { GenerateQuizResponseSchema, GeneratedQuizResponse } from '@/domain/quiz';
import { WebScraper } from './web-scraper';
import { getModel } from '@/lib/ai/models';

/** 問題数制限の型。生成・取り込みの両方で使用する。 */
export type MaxQuestions = 'default' | 'unlimited' | number;

export const SYSTEM_PROMPT = `あなたは技術の本質を問う問題作成の専門家です。

### 厳守事項
1. 正誤の根拠: クイズの正誤判定は、提供されたテキストの記述を唯一の根拠とすること。
2. 表面的な問いの禁止: 構文、API名、導入手順等の表面的で暗記で解ける問題は作成しない。
3. 解説の柔軟性: 解説では、テキスト外の普遍的な技術概念に基づいた補足を行い、地力を鍛えること。

### 出力制約
- 言語: 日本語
`;

export class QuizGenerator {
  private scraper: WebScraper;

  constructor() {
    this.scraper = new WebScraper();
  }

  /**
   * 問題数制限に応じたプロンプト補足文を生成する。
   * QuizImporter からも利用できるよう static メソッドとしてエクスポートする。
   */
  static buildMaxQuestionsInstruction(maxQuestions?: MaxQuestions): string {
    if (maxQuestions === 'unlimited') {
      return '\n入力内容に含まれるすべての問題・論点をカバーしてください。問題数に上限はありません。';
    }
    if (typeof maxQuestions === 'number' && maxQuestions > 0) {
      return `\n問題数はちょうど${maxQuestions}問作成してください。`;
    }
    // 'default' または未指定
    return '\n問題数は最大10問までとしてください。';
  }

  /**
   * AIを使用して、指定されたテキストの内容に基づくクイズを生成します。
   * @param text クイズ生成の元となるテキスト
   * @param modelId 使用するAIモデルのID（省略時はデフォルトモデル）
   * @param maxQuestions 問題数制限（'default': 最大10問 / 'unlimited': 無制限 / 数値: 指定数）
   * @returns 生成されたクイズ情報のオブジェクト
   */
  async generateQuizFromText(
    text: string,
    modelId?: string,
    maxQuestions?: MaxQuestions
  ): Promise<GeneratedQuizResponse> {

    // 入力テキストが長すぎる場合、トークン制限考慮で切り詰め
    const content = text.length > 20000 ? text.substring(0, 20000) : text;
    const maxQuestionsInstruction = QuizGenerator.buildMaxQuestionsInstruction(maxQuestions);

    try {
      const result = await generateText({
        model: getModel(modelId),
        output: Output.object({ schema: GenerateQuizResponseSchema }),
        system: SYSTEM_PROMPT,
        prompt: `以下の内容から理解度チェッククイズを作成してください：${maxQuestionsInstruction}\n${content}`,
      });

      return result.output as GeneratedQuizResponse;
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new Error('Failed to generate quiz from text.');
    }
  }

  /**
   * 指定されたURLのコンテンツをスクレイピングし、クイズを生成します。
   * @param url 学習元のURL
   * @param modelId 使用するAIモデルのID（省略時はデフォルトモデル）
   * @param maxQuestions 問題数制限（'default': 最大10問 / 'unlimited': 無制限 / 数値: 指定数）
   */
  async generateQuizFromUrl(
    url: string,
    modelId?: string,
    maxQuestions?: MaxQuestions
  ): Promise<GeneratedQuizResponse> {
    // 1. スクレイピング実行
    const text = await this.scraper.scrapeUrl(url);

    // 2. テキストが取得できなかった場合のエラーハンドリング
    if (!text || text.length < 50) {
      throw new Error('URLから十分なテキスト情報を取得できませんでした。');
    }

    // 3. クイズ生成
    return this.generateQuizFromText(text, modelId, maxQuestions);
  }
}
