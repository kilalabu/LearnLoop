import { generateText, Output } from 'ai';
import { GenerateQuizResponseSchema, GeneratedQuizResponse } from '../data/dto/quiz-schema';
import { WebScraper } from '../data/sources/web-scraper';
import { getModel } from '../ai/models';

const SYSTEM_PROMPT = `あなたは「知識」を定着させるための専門家です。
### 問題作成の指針
- 単なる用語の暗記ではなく、概念の理解や「どちらの設計を選ぶべきか」といった判断力を問う問題を優先する
- 間違いの選択肢は「よくある誤解」や「一見正解に見えるが特定の条件下でリスクがあるもの」にし、それ自体が学びのきっかけになる内容にする

### 出力制約
- 言語: 日本語
`;

export class QuizRepository {
  private scraper: WebScraper;

  constructor() {
    this.scraper = new WebScraper();
  }

  /**
   * AIを使用して、指定されたテキストの内容に基づくクイズを生成します。
   * @param text クイズ生成の元となるテキスト
   * @returns 生成されたクイズ情報のオブジェクト
   */
  async generateQuizFromText(text: string, modelId?: string): Promise<GeneratedQuizResponse> {

    // 入力テキストが長すぎる場合、トークン制限考慮で切り詰め
    const content = text.length > 20000 ? text.substring(0, 20000) : text;

    try {
      const result = await generateText({
        model: getModel(modelId),
        output: Output.object({ schema: GenerateQuizResponseSchema }),
        system: SYSTEM_PROMPT,
        prompt: `以下の内容から理解度チェッククイズを作成してください：\n${content}`,
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
   */
  async generateQuizFromUrl(url: string, modelId?: string): Promise<GeneratedQuizResponse> {
    // 1. スクレイピング実行
    const text = await this.scraper.scrapeUrl(url);

    // 2. テキストが取得できなかった場合のエラーハンドリング
    if (!text || text.length < 50) {
      throw new Error('URLから十分なテキスト情報を取得できませんでした。');
    }

    // 3. クイズ生成
    return this.generateQuizFromText(text, modelId);
  }
}
