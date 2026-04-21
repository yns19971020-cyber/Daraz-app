import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// ─────────────────────────────────────────────────
// POST /api/scrape — Scrape a Daraz / AliExpress product URL
// Uses z-ai-web-dev-sdk page_reader to fetch page HTML,
// then extracts title, description, images, original price.
// Applies 5% automatic markup:
//   displayPrice = originalPrice * 1.05
// ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    const validUrl = url.startsWith('http') ? url : `https://${url}`;

    // Detect source platform
    let source = 'unknown';
    if (validUrl.includes('daraz')) source = 'daraz';
    else if (validUrl.includes('aliexpress')) source = 'aliexpress';

    // ── Use page_reader to fetch the page ──
    const zai = await ZAI.create();
    const result = await zai.functions.invoke('page_reader', {
      url: validUrl,
    });

    const html: string = result.data.html || '';
    const pageTitle: string = result.data.title || '';

    const productData = extractProductInfo(html, pageTitle, validUrl, source);

    return NextResponse.json({ success: true, product: productData });
  } catch (error: unknown) {
    console.error('Scraping error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to scrape product';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ── Extraction helpers ──────────────────────────

function extractProductInfo(
  html: string,
  pageTitle: string,
  url: string,
  source: string
) {
  // ── Images ──
  const images = extractImages(html);

  // ── Price ──
  const originalPrice = extractPrice(html);

  // ── Description ──
  const description = extractDescription(html);

  // ── Title (clean) ──
  const title = cleanTitle(pageTitle, source) || `Product from ${source}`;

  // ── ★ Core pricing logic: 5% markup ★ ──
  const displayPrice = Math.round(originalPrice * 1.05 * 100) / 100;

  // ── Stock ──
  const stockStatus = detectStock(html);

  // ── Category ──
  const category = detectCategory(title);

  return {
    title,
    description,
    images:
      images.length > 0
        ? images
        : ['https://placehold.co/600x600/e2e8f0/64748b?text=No+Image'],
    originalPrice,
    displayPrice,
    sourceUrl: url,
    source,
    stockStatus,
    category,
  };
}

function extractImages(html: string): string[] {
  const ogImageRegex =
    /<meta[^>]*(?:property|name)=["']og:image["'][^>]*content=["'](https?:\/\/[^"']+)["']/i;
  const ogImage2Regex =
    /<meta[^>]*content=["'](https?:\/\/[^"']+)["'][^>]*(?:property|name)=["']og:image["']/i;

  const images: string[] = [];

  // OG image first
  const ogMatch = ogImageRegex.exec(html) || ogImage2Regex.exec(html);
  if (ogMatch?.[1]) images.push(ogMatch[1]);

  // All other product images
  const imgRegex =
    /src=["'](https?:\/\/[^"']+\.(jpg|jpeg|png|webp|gif))["']/gi;
  const seen = new Set<string>();
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const img = match[1];
    if (
      img &&
      !img.includes('icon') &&
      !img.includes('logo') &&
      !img.includes('tracker') &&
      !img.includes('pixel') &&
      !img.includes('sprite') &&
      img.length > 30 &&
      !seen.has(img)
    ) {
      seen.add(img);
      images.push(img);
    }
  }
  return images.slice(0, 10);
}

function extractPrice(html: string): number {
  const patterns: RegExp[] = [
    /["']price["']\s*:\s*["']?([\d,.]+)/gi,
    /data-price=["']([\d,.]+)/gi,
    /class=["'][^"']*price[^"']*["'][^>]*>([\d,.]+)/gi,
    /Rs\.?\s*([\d,.]+)/gi,
    /US\s*\$\s*([\d,.]+)/gi,
    /\$\s*([\d,.]{2,})/gi,
  ];
  for (const p of patterns) {
    const m = p.exec(html);
    if (m?.[1]) {
      const n = parseFloat(m[1].replace(/,/g, ''));
      if (n > 0 && n < 1_000_000) return n;
    }
  }
  return 99.99; // fallback
}

function extractDescription(html: string): string {
  const r1 = /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i;
  const r2 = /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i;
  const m = r1.exec(html) || r2.exec(html);
  return m?.[1] || '';
}

function cleanTitle(pageTitle: string, source: string): string {
  return pageTitle
    .replace(/\s*[-|].*Daraz.*$/i, '')
    .replace(/\s*[-|].*AliExpress.*$/i, '')
    .replace(/\s*[-|].*Buy.*$/i, '')
    .trim();
}

function detectStock(html: string): string {
  const lower = html.toLowerCase();
  if (lower.includes('out of stock')) return 'Out of Stock';
  if (lower.includes('limited stock') || lower.includes('limited')) return 'Limited';
  return 'In Stock';
}

function detectCategory(title: string): string {
  const map: Record<string, string> = {
    phone: 'Electronics',
    laptop: 'Electronics',
    tablet: 'Electronics',
    camera: 'Electronics',
    headphone: 'Electronics',
    speaker: 'Electronics',
    charger: 'Electronics',
    usb: 'Electronics',
    watch: 'Accessories',
    wallet: 'Accessories',
    bag: 'Fashion',
    shirt: 'Fashion',
    dress: 'Fashion',
    shoe: 'Fashion',
    jacket: 'Fashion',
    pant: 'Fashion',
    beauty: 'Beauty',
    skin: 'Beauty',
    hair: 'Beauty',
    cream: 'Beauty',
    home: 'Home & Living',
    kitchen: 'Home & Living',
    lamp: 'Home & Living',
    furniture: 'Home & Living',
    toy: 'Toys & Games',
    game: 'Toys & Games',
    sport: 'Sports',
    fitness: 'Sports',
    bottle: 'Sports',
  };
  const lower = title.toLowerCase();
  for (const [kw, cat] of Object.entries(map)) {
    if (lower.includes(kw)) return cat;
  }
  return 'General';
}
