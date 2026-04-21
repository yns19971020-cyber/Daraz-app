'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const DELIVERY_CHARGE = 5.0;

export default function CheckoutForm() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    notes: '',
  });

  const subtotal = getTotal();
  const total = subtotal + DELIVERY_CHARGE;

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) { toast.error('Please enter your name'); return; }
    if (!form.customerPhone.trim()) { toast.error('Please enter your phone number'); return; }
    if (!form.customerAddress.trim()) { toast.error('Please enter your address'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((item) => ({
            productId: item.productId,
            productTitle: item.productTitle,
            productImage: item.productImage,
            originalPrice: item.originalPrice,
            displayPrice: item.displayPrice,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        setOrderNumber(data.order.orderNumber);
        setSuccess(true);
        toast.success('Order placed successfully!');
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──
  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto py-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
        <p className="text-gray-500 mb-4">Thank you for your order. We&apos;ll process it shortly.</p>
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500 mb-1">Order Number</p>
            <p className="text-xl font-mono font-bold text-gray-900">{orderNumber}</p>
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2.5">
              <p className="text-xs text-yellow-800">📞 We&apos;ll contact you shortly to confirm your order.</p>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" className="rounded-full" onClick={() => router.push('/products')}>Continue Shopping</Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full" onClick={() => router.push('/admin/orders')}>View Orders</Button>
        </div>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="text-5xl mb-3">🛒</div>
        <h2 className="text-xl font-bold mb-2">Cart is Empty</h2>
        <p className="text-gray-500 mb-4">Add some products first!</p>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full" onClick={() => router.push('/products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-3 gap-6">
        {/* ── Shipping form ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2 space-y-5">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="w-5 h-5 text-orange-500" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" placeholder="John Doe" value={form.customerName} onChange={(e) => handleChange('customerName', e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" placeholder="+94 77 123 4567" type="tel" value={form.customerPhone} onChange={(e) => handleChange('customerPhone', e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea id="address" placeholder="Enter your complete address including city and postal code" value={form.customerAddress} onChange={(e) => handleChange('customerAddress', e.target.value)} required rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Input id="notes" placeholder="Any special instructions" value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 text-sm">Cash on Delivery</p>
                <p className="text-xs text-green-700">Pay when you receive your order. No online payment required.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Order summary sidebar ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-fit sticky top-24 border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-2.5">
                    <div className="w-11 h-11 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                      {item.productImage ? (
                        <img src={item.productImage} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm">📦</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900 line-clamp-1">{item.productTitle}</p>
                      <p className="text-[10px] text-gray-500">${item.displayPrice.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <span className="text-xs font-medium">${(item.displayPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span className="text-green-600 font-medium">${DELIVERY_CHARGE.toFixed(2)}</span></div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-red-600">${total.toFixed(2)}</span>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Placing Order...</> : `Place Order — $${total.toFixed(2)}`}
              </Button>
              <p className="text-[10px] text-gray-400 text-center">By placing this order you agree to our terms.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </form>
  );
}
