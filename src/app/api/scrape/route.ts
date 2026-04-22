import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const apiKey = process.env.SCRAPINGBEE_API_KEY;

    if (!url) return NextResponse.json({ error: "URL එකක් අවශ්‍යයි" }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: "API Key එක නැත" }, { status: 500 });

    // ScrapingBee එකට පරාමිතීන් එකතු කිරීම (Wait for price element)
    const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render_js=true&wait_for=.pdp-product-price,.pdp-price`;

    const response = await fetch(scrapingBeeUrl);
    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. නම ගැනීම
    const title = $('h1.pdp-mod-product-title').text().trim() || $('title').text().replace(' | Daraz.lk', '').trim();
    
    // 2. මිල ලබා ගැනීමට උත්සාහ කිරීම (විවිධ Selectors පාවිච්චි කර ඇත)
    let priceText = 
      $('.pdp-price_type_normal').first().text() || 
      $('.pdp-product-price span').first().text() || 
      $('[class*="price"]').first().text() || 
      '0';

    // රුපියල් ලකුණු, කොමා අයින් කර අගය ගැනීම
    let price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

    // 3. පින්තූරය ගැනීම
    const images: string[] = [];
    const metaImg = $('meta[property="og:image"]').attr('content') || $('.pdp-mod-common-image').attr('src');
    if (metaImg) images.push(metaImg.startsWith('//') ? 'https:' + metaImg : metaImg);

    // මිල තවමත් 0 නම් error එකක් දෙන්න
    if (!price || price === 0) {
      return NextResponse.json({ error: "මිල හඳුනාගත නොහැකි විය. කරුණාකර වෙනත් Item එකක් උත්සාහ කරන්න." }, { status: 400 });
    }

    // 5% Markup එකතු කිරීම
    const displayPrice = price * 1.05;

    return NextResponse.json({
      title,
      description: title,
      images: JSON.stringify(images),
      originalPrice: price,
      displayPrice: displayPrice,
      sourceUrl: url,
      source: url.includes('daraz') ? 'daraz' : 'aliexpress',
    });

  } catch (error) {
    return NextResponse.json({ error: "සර්වර් එකේ දෝෂයකි" }, { status: 500 });
  }
}
