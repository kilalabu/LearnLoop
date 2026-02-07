import { generateText, Output } from 'ai';
import { GenerateQuizResponseSchema, GeneratedQuizResponse } from '../data/dto/quiz-schema';
import { WebScraper } from '../data/sources/web-scraper';
import { getModel } from '../ai/models';

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
    const systemPrompt = `
あなたはプロフェッショナルな教育コンテンツ作成者です。
提供された内容に基づいて、学習効果の高い選択問題を作成してください。

以下の制約を守ってください：
1. **言語**: 日本語で出力すること。
2. **問題形式**: 
   - 選択肢は4つ以内で作成すること。
   - 正解は1つ以上存在すること（単一正解または複数正解）。
   - 正解は \`answers\` 配列にすべて含めること。
3. **内容**:
   - 提供された内容の重要なポイントを網羅すること。
   - 単なる用語の暗記ではなく、概念の理解を問う問題を優先すること。
4. **解説**:
   - 正解の理由だけでなく、なぜ他の選択肢が間違いなのかも簡潔に説明すること。

出力はJSON形式で行い、\`GenerateQuizResponseSchema\` に従ってください。
`;

    // 入力テキストが長すぎる場合、トークン制限考慮で切り詰め
    // gpt-4o-miniは128kコンテキスト持つが、安全のため20000文字程度を目安にする
    const content = text.length > 20000 ? text.substring(0, 20000) : text;

    try {
      const result = await generateText({
        model: getModel(modelId),
        output: Output.object({ schema: GenerateQuizResponseSchema }),
        system: systemPrompt,
        prompt: `以下のテキストからクイズを作成してください：\n\n${content}`,
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
