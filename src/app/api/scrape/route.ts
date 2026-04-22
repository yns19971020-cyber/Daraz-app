import { NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function POST(req: Request) {
  let browser;
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL එකක් අවශ්‍යයි" }, { status: 400 });

    // Browser එක Open කිරීම (Stealth settings සමඟ)
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    // පිටුවට පිවිසීම (Timeout එක තත්පර 60ක් දක්වා වැඩි කර ඇත)
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // දත්ත ලබාගන්නා තෙක් මඳක් රැඳී සිටීම (මිල Load වීමට කාලය අවශ්‍යයි)
    await page.waitForSelector('.pdp-price', { timeout: 10000 }).catch(() => null);

    const productData = await page.evaluate(() => {
      // 1. මිල ලබාගැනීම
      const priceSelectors = [
        '.pdp-price_type_normal',
        '.pdp-product-price',
        '#module_product_price_1',
        '.product-price-value'
      ];
      
      let priceText = '0';
      for (const selector of priceSelectors) {
        const el = document.querySelector(selector);
        if (el && el.textContent) {
          priceText = el.textContent;
          break;
        }
      }

      // 2. නම ලබාගැනීම
      const title = document.querySelector('h1')?.innerText || document.title.split('|')[0].trim();

      // 3. පින්තූරය ලබාගැනීම
      const img = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || 
                  document.querySelector('.pdp-mod-common-image')?.getAttribute('src');

      return {
        title,
        priceText,
        image: img
      };
    });

    await browser.close();

    // මිල ගණනය කිරීම
    const originalPrice = parseFloat(productData.priceText.replace(/[^0-9.]/g, ''));
    
    if (!originalPrice || originalPrice === 0) {
      return NextResponse.json({ error: "මිල ලබා ගැනීමට නොහැකි විය. කරුණාකර සම්පූර්ණ ලින්ක් එක (Long URL) උත්සාහ කරන්න." }, { status: 400 });
    }

    // 5% Markup එකතු කිරීම
    const displayPrice = originalPrice * 1.05;

    return NextResponse.json({
      title: productData.title,
      description: productData.title,
      images: JSON.stringify([productData.image?.startsWith('//') ? 'https:' + productData.image : productData.image]),
      originalPrice,
      displayPrice,
      sourceUrl: url,
      source: url.includes('daraz') ? 'daraz' : 'aliexpress',
    });

  } catch (error) {
    if (browser) await browser.close();
    console.error("Scraping Error:", error);
    return NextResponse.json({ error: "දත්ත ලබාගැනීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න." }, { status: 500 });
  }
}
