'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Suspense, useMemo } from 'react';

interface Product {
  id: string;
  title: string;
  description: string;
  images: string;
  originalPrice: number;
  displayPrice: number;
  source: string;
  stockStatus: string;
  category: string;
  isActive: boolean;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'All';
  const search = searchParams.get('search') || '';
  const addItem = useCartStore((s) => s.addItem);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', category, search],
    queryFn: async () => {
      const params = new URLSearchParams({ active: 'true' });
      if (category !== 'All') params.set('category', category);
      if (search) params.set('search', search);
      const res = await fetch(`/api/products?${params}`);
      const json = await res.json();
      return json.products as Product[];
    },
  });

  const handleAddToCart = (p: Product) => {
    const images: string[] = [];
    try { JSON.parse(p.images || '[]').forEach((img: string) => images.push(img)); } catch { /* */ }
    addItem({
      productId: p.id,
      productTitle: p.title,
      productImage: images[0] || '',
      originalPrice: p.originalPrice,
      displayPrice: p.displayPrice,
      quantity: 1,
    });
    toast.success('Added to cart!', { description: p.title.substring(0, 50) });
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ── Hero Banner ── */}
      <section className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_35px,rgba(255,255,255,0.1)_35px,rgba(255,255,255,0.1)_70px)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <Badge className="bg-yellow-400 text-black mb-3 px-3 py-0.5 text-xs font-semibold">
              🔥 Hot Deals Available
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 leading-tight">
              Shop from <span className="text-yellow-300">Daraz & AliExpress</span>
            </h1>
            <p className="text-base md:text-lg text-white/90 mb-6 max-w-lg">
              Browse thousands of products. We handle ordering, delivery, and everything in between.
              Just browse, add to cart, and checkout!
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="#grid">
                <Button size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-full px-7 shadow-lg">
                  Browse Products
                </Button>
              </Link>
              <Link href="/cart">
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 rounded-full px-7">
                  View Cart
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { icon: '📦', label: 'Products', value: products.length || '500+' },
            { icon: '🚚', label: 'Delivery', value: '$5.00 flat' },
            { icon: '💰', label: 'Markup', value: 'Only 5%' },
            { icon: '🎧', label: 'Support', value: '24/7' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="font-bold text-gray-900">{s.value}</p>
                <p className="text-[11px] text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section id="grid" className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            {category === 'All' ? 'All Products' : category}
          </h2>
          <p className="text-sm text-gray-500">
            {products.length} product{products.length !== 1 ? 's' : ''} found
            {search && ` for "${search}"`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-3 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {search ? `No results for "${search}".` : 'No products in this category yet.'}
            </p>
            <Link href="/products">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">View All</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} onAdd={() => handleAddToCart(product)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><p>Loading...</p></div>}>
      <ProductsContent />
    </Suspense>
  );
}

// ── Individual Card ──────────────────────────────

function ProductCard({
  product,
  index,
  onAdd,
}: {
  product: Product;
  index: number;
  onAdd: () => void;
}) {
  const images = useMemo(() => {
    try { return JSON.parse(product.images || '[]') as string[]; } catch { return []; }
  }, [product.images]);
  const mainImage = images[0] || '';
  const savings = product.originalPrice > 0
    ? Math.round((1 - product.originalPrice / product.displayPrice) * 100)
    : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.04 }}>
      <Card className="group overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 bg-white">
        {/* Image */}
        <Link href={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/400x400/f5f5f4/78716c?text=${encodeURIComponent(product.title.substring(0, 12))}`;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
              <span className="text-4xl">📦</span>
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {savings > 0 && <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0">-{savings}%</Badge>}
            {product.source && <Badge className="bg-black/60 text-white text-[10px] px-1.5 py-0 backdrop-blur-sm">{product.source}</Badge>}
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 rounded-full p-2 shadow"><Eye className="w-4 h-4 text-gray-700" /></span>
          </div>
        </Link>

        {/* Info */}
        <CardContent className="p-3">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1.5 min-h-[2.5rem] leading-snug hover:text-orange-600 transition-colors">
              {product.title}
            </h3>
          </Link>
          <div className="flex items-end gap-1.5 mb-2">
            <span className="text-base font-bold text-red-600">${product.displayPrice.toFixed(2)}</span>
            {product.originalPrice !== product.displayPrice && (
              <span className="text-[11px] text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
              ))}
              <span className="text-[10px] text-gray-400 ml-1">4.8</span>
            </div>
            <Button
              size="sm"
              className="h-7 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-2.5 text-xs"
              onClick={(e) => { e.preventDefault(); onAdd(); }}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />Add
            </Button>
          </div>
          {product.stockStatus === 'Out of Stock' && (
            <p className="text-[11px] text-red-500 font-medium mt-1.5">Out of Stock</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
