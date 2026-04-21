'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Store, Shield, Menu, X, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/lib/store';
import { useState } from 'react';

const categories = [
  'All',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Beauty',
  'Accessories',
  'Toys & Games',
  'Sports',
];

export default function SiteHeader() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const isAdmin = pathname.startsWith('/admin');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo + mobile toggle */}
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-1.5 text-white hover:bg-white/20 rounded-lg"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link href="/" className="flex items-center gap-2 group">
                <Store className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                <span className="text-lg font-bold text-white tracking-tight">
                  ShopBridge
                </span>
              </Link>
            </div>

            {/* Desktop search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <SearchBar />
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1">
              {isAdmin ? (
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" asChild>
                  <Link href="/">
                    <Store className="w-5 h-5" />
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" asChild>
                  <Link href="/admin/orders">
                    <Shield className="w-5 h-5" />
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20" asChild>
                <Link href="/cart">
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full">
                      {itemCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-2">
            <SearchBar />
          </div>
        </div>

        {/* Categories bar */}
        <div className="bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-hide">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={cat === 'All' ? '/products' : `/products?category=${encodeURIComponent(cat)}`}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 w-64 bg-white h-full shadow-xl p-4">
            <nav className="space-y-1">
              <Link href="/" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                🏠 Home
              </Link>
              <Link href="/products" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                📦 Products
              </Link>
              <Link href="/cart" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                🛒 Cart ({itemCount})
              </Link>
              <Link href="/checkout" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                💳 Checkout
              </Link>
              <hr className="my-2" />
              <Link href="/admin/orders" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                🛡️ Admin — Orders
              </Link>
              <Link href="/admin/add-product" className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
                ➕ Admin — Add Product
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function SearchBar() {
  const [query, setQuery] = useState('');
  return (
    <form action="/products" method="get" className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          name="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full h-9 pl-9 pr-4 bg-white/95 border-0 rounded-full shadow-sm text-sm focus-visible:ring-2 focus-visible:ring-yellow-400 focus:outline-none"
        />
      </div>
    </form>
  );
}

// ── Reusable footer ──────────────────────────────

export function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Store className="w-5 h-5 text-orange-400" />
              <span className="text-lg font-bold text-white">ShopBridge</span>
            </div>
            <p className="text-sm text-gray-400">
              Your trusted proxy ordering platform for Daraz & AliExpress products.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2 text-sm">Shop</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/products" className="hover:text-orange-400 transition-colors">All Products</Link></li>
              <li><Link href="/products?category=Electronics" className="hover:text-orange-400 transition-colors">Electronics</Link></li>
              <li><Link href="/products?category=Fashion" className="hover:text-orange-400 transition-colors">Fashion</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2 text-sm">Support</h4>
            <ul className="space-y-1.5 text-sm text-gray-400">
              <li>Fast Delivery (3-7 days)</li>
              <li>Cash on Delivery</li>
              <li>24/7 Support</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2 text-sm">Admin</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link href="/admin/orders" className="hover:text-orange-400 transition-colors">Manage Orders</Link></li>
              <li><Link href="/admin/add-product" className="hover:text-orange-400 transition-colors">Add Product</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-4 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} ShopBridge. Proxy ordering from Daraz &amp; AliExpress. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
