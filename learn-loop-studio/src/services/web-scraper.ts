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

      console.log(`[WebScraper] Scraped length: ${cleanText.length} chars from ${url}`);

      // コンテンツが少なすぎる場合は診断ログを出力
      if (cleanText.length < 100) {
        this.runDiagnostics(url, html, $);
      }

      return cleanText;

    } catch (error) {
      console.error('Scraping error:', error);
      throw new Error(`Failed to scrape URL: ${url}`);
    }
  }

  /**
   * スクレイピング失敗時の詳細診断を出力する
   */
  private runDiagnostics(url: string, html: string, $: cheerio.CheerioAPI) {
    console.warn(`\n=== [WebScraper Diagnosis] Content too short (< 100 chars) ===`);
    console.warn(`URL: ${url}`);
    console.warn(`HTML Size: ${html.length.toLocaleString()} bytes`);

    // 1. タイトル確認
    const title = $('title').text().trim();
    console.warn(`Page Title: ${title || '(No Title)'}`);

    // 2. SPA / CSR の可能性を判定
    const isNext = $('#__NEXT_DATA__').length > 0;
    const isNuxt = html.includes('window.__NUXT__');
    const isHypernova = $('[data-hypernova-key]').length > 0; // Qiita etc.

    if (isNext) console.warn(`[SPA Detect] Next.js detected (__NEXT_DATA__) -> Content might be rendered client-side.`);
    if (isNuxt) console.warn(`[SPA Detect] Nuxt.js detected -> Content might be rendered client-side.`);
    if (isHypernova) console.warn(`[SPA Detect] Hypernova detected -> Content might be rendered client-side.`);

    if (!isNext && !isNuxt && !isHypernova && html.length < 5000) {
      console.warn(`[Suspicion] HTML is very small (${html.length} bytes). Might be blocked by WAF or Login wall.`);
    }

    // 3. 削除された要素の確認（過剰な削除ではないか？）
    console.warn(`--- Elements removed by cleanup rules ---`);
    // 新しい cheerio インスタンスで削除ロジックをシミュレーション
    const $debug = cheerio.load(html);
    const rules = [
      'script', 'style', 'noscript', 'iframe',
      'header', 'footer', 'nav', 'aside',
      '.ads', '[class*="ad-"]', '[id*="ad-"]'
    ];

    const removedStats: string[] = [];
    for (const selector of rules) {
      const count = $debug(selector).length;
      if (count > 0) {
        removedStats.push(`${selector}: ${count}`);
      }
    }
    console.warn(`Removed counts: ${removedStats.join(', ') || 'None'}`);

    console.warn(`============================================================\n`);
  }
}
