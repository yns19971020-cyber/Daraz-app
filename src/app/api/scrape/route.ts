import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL එකක් අවශ්‍යයි" }, { status: 400 });
    }

    const apiKey = process.env.SCRAPINGBEE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key එක සොයාගත නොහැක. .env ෆයිල් එක පරීක්ෂා කරන්න." }, { status: 500 });
    }

    // ScrapingBee API URL එක සැකසීම (render_js=true මඟින් Daraz හි JavaScript දත්තද කියවයි)
    const scrapingBeeUrl = `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render_js=true`;

    // දත්ත ලබාගැනීම
    const response = await fetch(scrapingBeeUrl);
    if (!response.ok) {
      throw new Error(`ScrapingBee Error: ${response.statusText}`);
    }
    const html = await response.text();

    // Cheerio හරහා HTML එක කියවීම
    const $ = cheerio.load(html);

    // නම ලබා ගැනීම
    const title = $('title').text().replace(' | Daraz.lk', '').trim() || 'අලුත් භාණ්ඩය';
    
    // මිල ලබා ගැනීම
    const priceText = $('.pdp-price_type_normal').text() || '0';
    let price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    if (isNaN(price)) price = 0;

    // පින්තූරය ලබා ගැනීම
    const images: string[] = [];
    const metaImg = $('meta[property="og:image"]').attr('content');
    if (metaImg) images.push(metaImg);

    if (price === 0) {
      return NextResponse.json({ error: "මිල ලබා ගැනීමට නොහැකි විය. වෙනත් ලින්ක් එකක් උත්සාහ කරන්න." }, { status: 400 });
    }

    // 5% කින් මිල වැඩි කිරීම
    const displayPrice = price * 1.05;

    const productData = {
      title: title,
      description: title,
      images: JSON.stringify(images),
      originalPrice: price,
      displayPrice: displayPrice,
      sourceUrl: url,
      source: url.includes('daraz') ? 'daraz' : 'aliexpress',
      stockStatus: "In Stock"
    };

    return NextResponse.json(productData);

  } catch (error) {
    console.error("Scraping Error:", error);
    return NextResponse.json({ error: "දත්ත ලබාගැනීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න." }, { status: 500 });
  }
}
