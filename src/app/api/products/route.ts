import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────
// GET  /api/products          — List products (search, filter)
// POST /api/products          — Create a new product
//
// ★ POST auto-applies 5% markup if displayPrice omitted:
//   displayPrice = originalPrice * 1.05
// ─────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const category = sp.get('category');
    const search = sp.get('search');
    const activeOnly = sp.get('active');

    let where: Record<string, unknown> = {};

    if (activeOnly === 'true') where.isActive = true;
    if (category && category !== 'All') where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      images,
      originalPrice,
      displayPrice,
      sourceUrl,
      source,
      stockStatus,
      category,
    } = body;

    if (!title || originalPrice === undefined) {
      return NextResponse.json(
        { success: false, error: 'Title and original price are required' },
        { status: 400 }
      );
    }

    // ★ 5% automatic markup ★
    const calculatedDisplayPrice =
      displayPrice !== undefined ? parseFloat(displayPrice) : parseFloat(originalPrice) * 1.05;

    const product = await db.product.create({
      data: {
        title,
        description: description || '',
        images:
          typeof images === 'string' ? images : JSON.stringify(images || []),
        originalPrice: parseFloat(originalPrice),
        displayPrice: Math.round(calculatedDisplayPrice * 100) / 100,
        sourceUrl: sourceUrl || '',
        source: source || '',
        stockStatus: stockStatus || 'In Stock',
        category: category || 'General',
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
