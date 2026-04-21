import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────
// GET  /api/orders  — List all orders (newest first)
// POST /api/orders  — Place a new order
//
// POST body: { customerName, customerPhone, customerAddress, items[], notes }
//   items[] = [{ productId, productTitle, productImage, originalPrice, displayPrice, quantity }]
//   Automatically calculates: subtotal + $5.00 delivery = totalAmount
//   Generates orderNumber: ORD-YYYYMMDD-XXXX
// ─────────────────────────────────────────────────

const DELIVERY_CHARGE = 5.0;

export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, customerAddress, items, notes } = body;

    if (!customerName || !customerPhone || !customerAddress || !items?.length) {
      return NextResponse.json(
        { success: false, error: 'Customer details and items are required' },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (sum: number, it: { displayPrice: number; quantity: number }) =>
        sum + it.displayPrice * it.quantity,
      0
    );
    const totalAmount = subtotal + DELIVERY_CHARGE;

    const now = new Date();
    const orderNumber =
      `ORD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        customerAddress,
        status: 'Pending',
        subtotal: Math.round(subtotal * 100) / 100,
        deliveryCharge: DELIVERY_CHARGE,
        totalAmount: Math.round(totalAmount * 100) / 100,
        notes: notes || '',
        items: {
          create: items.map(
            (it: {
              productId: string;
              productTitle: string;
              productImage: string;
              originalPrice: number;
              displayPrice: number;
              quantity: number;
            }) => ({
              productId: it.productId,
              productTitle: it.productTitle,
              productImage: it.productImage || '',
              originalPrice: it.originalPrice,
              displayPrice: it.displayPrice,
              quantity: it.quantity,
              itemTotal: Math.round(it.displayPrice * it.quantity * 100) / 100,
            })
          ),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
