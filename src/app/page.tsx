import Link from 'next/link';
import { ArrowRight, ShoppingBag, Shield, Store, Truck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(45deg,transparent,transparent_40px,rgba(255,255,255,0.15)_40px,rgba(255,255,255,0.15)_80px)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 lg:py-36">
          <div className="max-w-2xl">
            <Badge className="bg-yellow-400 text-black mb-4 px-3 text-xs font-semibold">
              🛒 Proxy Ordering System
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-[1.1]">
              Shop from{' '}
              <span className="text-yellow-300">Daraz &amp; AliExpress</span>{' '}
              with Ease
            </h1>
            <p className="text-base md:text-lg text-white/90 mb-8 max-w-lg">
              Browse thousands of products, add to cart, and checkout — we handle
              the proxy ordering, delivery, and everything in between.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-full px-8 shadow-lg text-sm">
                  Browse Products <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link href="/admin/add-product">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-full px-8 text-sm">
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <ShoppingBag className="w-6 h-6 text-orange-500" />, title: 'Full Catalog', desc: 'Browse products scraped from Daraz & AliExpress' },
            { icon: <Truck className="w-6 h-6 text-orange-500" />, title: '$5 Delivery', desc: 'Flat delivery charge, cash on delivery available' },
            { icon: <Shield className="w-6 h-6 text-orange-500" />, title: 'Admin Panel', desc: 'Scrape URLs, manage orders, update statuses' },
            { icon: <Star className="w-6 h-6 text-orange-500" />, title: '5% Markup', desc: 'Automatic pricing: Original Price × 1.05' },
          ].map((f) => (
            <Card key={f.title} className="border-0 shadow-sm text-center p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Admin Imports Products', desc: 'Paste Daraz/AliExpress URLs. Our scraper fetches title, images, price automatically and applies a 5% markup.', accent: 'from-orange-400 to-orange-500' },
              { step: '02', title: 'Customers Browse & Order', desc: 'Customers browse the catalog, add to cart, enter shipping details, and place orders — all within the app.', accent: 'from-red-400 to-red-500' },
              { step: '03', title: 'Admin Fulfills Orders', desc: 'View incoming orders in the admin panel. Use the original source links to place orders on Daraz/AliExpress.', accent: 'from-pink-400 to-pink-500' },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center text-white font-bold text-sm mb-3 shadow-lg`}>
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Get Started?</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Browse products or start importing from Daraz and AliExpress right now.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 text-sm">
                <Store className="w-4 h-4 mr-2" /> Shop Now
              </Button>
            </Link>
            <Link href="/admin/add-product">
              <Button size="lg" variant="outline" className="border-gray-300 rounded-full px-8 text-sm">
                <Shield className="w-4 h-4 mr-2" /> Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Spacer for footer */}
      <div className="flex-1" />
    </div>
  );
}
