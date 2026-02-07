import * as cheerio from 'cheerio';

export class WebScraper {
  /**
   * 指定されたURLからHTMLを取得し、学習に適したテキストのみを抽出します。
   * @param url 抽出対象のURL
   * @returns 抽出されたテキストコンテンツ
   */
  async scrapeUrl(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        // User-Agentを設定して、ブラウザからのアクセスを模倣する
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // 不要な要素を削除 (Nav, Footer, Script, Styleなど)
      $('script').remove();
      $('style').remove();
      $('noscript').remove();
      $('iframe').remove();
      $('header').remove();
      $('footer').remove();
      $('nav').remove();
      $('aside').remove();
      $('.ads').remove();
      $('[class*="ad-"]').remove();
      $('[id*="ad-"]').remove();

      // メインコンテンツと思われる部分からテキストを抽出
      // 記事本文によく使われるタグを優先的に探すが、汎用的に body から取得
      // (サイトごとの最適化は今後の課題)
      const bodyText = $('body').text();

      // 空白・改行の正規化
      // 連続する空白や改行を1つのスペース/改行に置換
      const cleanText = bodyText
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();

      console.log('Scraped text length:', cleanText.length);
      return cleanText;

    } catch (error) {
      console.error('Scraping error:', error);
      throw new Error(`Failed to scrape URL: ${url}`);
    }
  }
}
