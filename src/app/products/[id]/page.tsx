'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  Star,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';

interface Product {
  id: string;
  title: string;
  description: string;
  images: string;
  originalPrice: number;
  displayPrice: number;
  sourceUrl: string;
  source: string;
  stockStatus: string;
  category: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      const json = await res.json();
      return json.product as Product;
    },
    enabled: !!id,
  });

  const images = useMemo(() => {
    if (!product) return [];
    try { return JSON.parse(product.images || '[]') as string[]; } catch { return []; }
  }, [product]);

  const savings = product ? Math.round((1 - product.originalPrice / product.displayPrice) * 100) : 0;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-gray-100 rounded animate-pulse" />
            <div className="h-6 w-1/2 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-12 w-1/3 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold">Product not found</h2>
        <Link href="/products"><Button className="mt-4">Back to Products</Button></Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productTitle: product.title,
      productImage: images[0] || '',
      originalPrice: product.originalPrice,
      displayPrice: product.displayPrice,
      quantity: qty,
    });
    toast.success('Added to cart!');
    setQty(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ── Image Gallery ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="relative aspect-square bg-gray-50">
              <AnimatePresence mode="wait">
                {images.length > 0 && images[imgIdx] ? (
                  <motion.img
                    key={imgIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={images[imgIdx]}
                    alt={product.title}
                    className="w-full h-full object-contain p-6"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/600x600/f5f5f4/78716c?text=Image`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
                    <span className="text-8xl">📦</span>
                  </div>
                )}
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((p) => (p > 0 ? p - 1 : images.length - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setImgIdx((p) => (p < images.length - 1 ? p + 1 : 0))} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow"><ChevronRight className="w-5 h-5" /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? 'bg-orange-500 w-5' : 'bg-gray-300'}`} />
                    ))}
                  </div>
                </>
              )}
              {savings > 0 && <Badge className="absolute top-3 left-3 bg-red-500 text-white text-sm px-2.5 py-0.5">-{savings}% OFF</Badge>}
            </div>
          </Card>
          {images.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-orange-500 shadow' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Product Info ── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {product.source && (
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
              📦 From {product.source.charAt(0).toUpperCase() + product.source.slice(1)}
            </Badge>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>

          <div className="flex items-center gap-2">
            <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div>
            <span className="text-sm text-gray-500">(4.8) · 128 reviews</span>
          </div>

          {/* Price card */}
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-100">
            <CardContent className="p-4">
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-red-600">${product.displayPrice.toFixed(2)}</span>
                {product.originalPrice !== product.displayPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                    <Badge className="bg-red-500 text-white">SAVE {savings}%</Badge>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes + $5.00 delivery</p>
            </CardContent>
          </Card>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${product.stockStatus === 'In Stock' ? 'bg-green-500' : product.stockStatus === 'Limited' ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${product.stockStatus === 'In Stock' ? 'text-green-700' : 'text-yellow-700'}`}>{product.stockStatus}</span>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description || 'No description available. Contact us for more info.'}
            </p>
          </div>

          <Separator />

          {/* Quantity + Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-9 w-9 flex items-center justify-center hover:bg-gray-100 transition-colors"><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center font-medium text-sm">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="h-9 w-9 flex items-center justify-center hover:bg-gray-100 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl" onClick={handleAddToCart} disabled={product.stockStatus === 'Out of Stock'}>
                <ShoppingCart className="w-4 h-4 mr-2" />{product.stockStatus === 'Out of Stock' ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl" onClick={() => { handleAddToCart(); router.push('/checkout'); }} disabled={product.stockStatus === 'Out of Stock'}>
                Buy Now
              </Button>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Fast Delivery', desc: '3-7 business days' },
              { icon: Shield, label: 'Secure', desc: '100% protected' },
              { icon: RotateCcw, label: 'Returns', desc: 'Easy returns' },
            ].map(({ icon: Icon, label, desc }) => (
              <Card key={label} className="text-center p-2.5 border-0 shadow-none bg-gray-50">
                <Icon className="w-5 h-5 mx-auto mb-1 text-orange-500" />
                <p className="text-xs font-medium text-gray-900">{label}</p>
                <p className="text-[10px] text-gray-500">{desc}</p>
              </Card>
            ))}
          </div>

          {product.sourceUrl && (
            <p className="text-[11px] text-gray-400 truncate">Source: {product.sourceUrl}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
