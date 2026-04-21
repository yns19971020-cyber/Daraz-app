import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────
// GET    /api/products/[id]  — Single product
// PATCH  /api/products/[id]  — Update product fields
// DELETE /api/products/[id]  — Remove product
// ─────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({ where: { id } });
    if (!product)
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const product = await db.product.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.images !== undefined && {
          images: typeof body.images === 'string' ? body.images : JSON.stringify(body.images),
        }),
        ...(body.originalPrice !== undefined && { originalPrice: parseFloat(body.originalPrice) }),
        ...(body.displayPrice !== undefined && { displayPrice: parseFloat(body.displayPrice) }),
        ...(body.sourceUrl !== undefined && { sourceUrl: body.sourceUrl }),
        ...(body.source !== undefined && { source: body.source }),
        ...(body.stockStatus !== undefined && { stockStatus: body.stockStatus }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
