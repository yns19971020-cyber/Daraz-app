'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const DELIVERY_CHARGE = 5.0;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCartStore();
  const subtotal = getTotal();
  const total = subtotal + (items.length > 0 ? DELIVERY_CHARGE : 0);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-20 h-20 mx-auto mb-5 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-9 h-9 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-5">Looks like you haven&apos;t added any products yet.</p>
          <Link href="/products">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-7">Start Shopping</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Continue Shopping
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-5">
        Shopping Cart ({getItemCount()} items)
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div key={item.productId} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}>
                <Card className="overflow-hidden">
                  <CardContent className="p-3.5">
                    <div className="flex gap-3">
                      <Link href={`/products/${item.productId}`} className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                        {item.productImage ? (
                          <img src={item.productImage} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/f5f5f4/78716c?text=Item'; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.productId}`} className="font-medium text-sm text-gray-900 line-clamp-2 hover:text-orange-600 transition-colors">
                          {item.productTitle}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-bold text-sm text-red-600">${item.displayPrice.toFixed(2)}</span>
                          {item.originalPrice !== item.displayPrice && (
                            <span className="text-[10px] text-gray-400 line-through">${item.originalPrice.toFixed(2)}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border rounded-md">
                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="h-7 w-7 flex items-center justify-center hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                            <span className="w-9 text-center text-xs font-medium">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="h-7 w-7 flex items-center justify-center hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-semibold text-sm">${(item.displayPrice * item.quantity).toFixed(2)}</span>
                            <button onClick={() => { removeItem(item.productId); toast.info('Removed from cart'); }} className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 text-sm" onClick={() => { clearCart(); toast.info('Cart cleared'); }}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear Cart
          </Button>
        </div>

        {/* Summary */}
        <Card className="h-fit sticky top-24 border-0 shadow-lg">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-gray-900">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal ({getItemCount()} items)</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span className="font-medium text-green-600">${DELIVERY_CHARGE.toFixed(2)}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="font-semibold">Total</span><span className="text-xl font-bold text-red-600">${total.toFixed(2)}</span></div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 text-xs text-green-700 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" /> Cash on delivery available
            </div>
            <Link href="/checkout" className="block">
              <Button className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl">Proceed to Checkout</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
