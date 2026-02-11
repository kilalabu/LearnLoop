import * as cheerio from 'cheerio';
// import fetch from 'node-fetch'; // rely on global fetch

/**
 * Debug utility to test scraping against a URL.
 * Usage: npx tsx scripts/debug-scraper.ts <URL>
 */
async function testScrape(url: string) {
  console.log(`\n=== Testing Scraper for: ${url} ===\n`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`HTML Length: ${html.length.toLocaleString()} bytes`);

    const $ = cheerio.load(html);

    // 1. Basic Metadata
    const title = $('title').text();
    console.log(`Page Title: ${title}`);

    // 2. SPA / Hydration Detection
    const nextData = $('#__NEXT_DATA__').length; // Next.js
    const nuxtData = html.includes('window.__NUXT__') ? 'Yes' : 'No'; // Nuxt.js (heuristic)
    const hypernova = $('[data-hypernova-key]').length; // Airbnb's Hypernova (used by Qiita)

    if (nextData) console.log(`[Info] Detected Next.js (__NEXT_DATA__)`);
    if (hypernova) console.log(`[Info] Detected Hypernova components (Qiita style)`);

    // 3. Simulate Removal Logic (Same as WebScraper.ts)
    const elementsToRemove = [
      'script', 'style', 'noscript', 'iframe',
      'header', 'footer', 'nav', 'aside',
      '.ads', '[class*="ad-"]', '[id*="ad-"]'
    ];

    const $clone = cheerio.load(html);
    let removedCount = 0;

    elementsToRemove.forEach(selector => {
      const found = $clone(selector).length;
      if (found > 0) removedCount += found;
      $clone(selector).remove();
    });

    console.log(`[Info] Removed ${removedCount} elements based on cleanup rules.`);

    // 4. Extract Text
    const bodyText = $clone('body').text();
    const cleanText = bodyText
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    console.log(`\n--- Scraped Result ---`);
    console.log(`Character Count: ${cleanText.length.toLocaleString()}`);
    console.log(`\nPreview (first 500 chars):\n${'-'.repeat(50)}`);
    console.log(cleanText.substring(0, 500));
    console.log(`${'-'.repeat(50)}\n`);

    // 5. Diagnostics
    if (cleanText.length < 50) {
      console.warn(`[WARNING] Content is very short (<50 chars). Likely reasons:`);
      console.warn(` - Page is SPA (Single Page App) and content is rendered via JS.`);
      console.warn(` - Access was blocked (WAF, Captcha, Login Wall).`);
      console.warn(` - Cleanup rules accidentally removed the main content.`);
    } else {
      console.log(`[SUCCESS] Content seems sufficient.`);
    }

  } catch (error) {
    console.error(`[ERROR] Scraping failed:`, error);
  }
}

const targetUrl = process.argv[2] || 'https://qiita.com/degudegu2510/items/eff0f63dac99554e6439';
testScrape(targetUrl);
