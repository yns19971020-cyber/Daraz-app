'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import {
  Link2, Loader2, Check, AlertCircle, Sparkles, Store, ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ScrapedProduct {
  title: string;
  description: string;
  images: string[];
  originalPrice: number;
  displayPrice: number;
  sourceUrl: string;
  source: string;
  stockStatus: string;
  category: string;
}

export default function AdminAddProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<ScrapedProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const handleScrape = async () => {
    if (!url.trim()) { setError('Please enter a product URL'); return; }
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim() }) });
      const json = await res.json();
      if (json.success) { setData(json.product); toast.success('Product scraped!'); }
      else { setError(json.error || 'Failed to scrape'); }
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json();
      if (json.success) { toast.success('Product saved!'); queryClient.invalidateQueries({ queryKey: ['products'] }); router.push('/admin/orders'); }
      else { toast.error(json.error || 'Save failed'); }
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm"><ArrowLeft className="w-4 h-4" /> Store</Link>
          <div className="h-5 w-px bg-gray-700" />
          <Link href="/admin/orders" className="text-sm text-gray-400 hover:text-white mr-4">Orders</Link>
          <h1 className="font-semibold">Add Product</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* URL Input */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Import from URL
              </CardTitle>
              <p className="text-xs text-gray-500">Paste a Daraz or AliExpress product URL to auto-import details.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="https://www.daraz.lk/products/..." value={url} onChange={(e) => setUrl(e.target.value)} className="pl-9" onKeyDown={(e) => e.key === 'Enter' && handleScrape()} />
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleScrape} disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Fetching...</> : 'Fetch'}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] text-gray-400">Supported:</span>
                {['Daraz', 'AliExpress'].map((s) => (
                  <Badge key={s} variant="secondary" className="text-[10px]"><Store className="w-2.5 h-2.5 mr-0.5" />{s}</Badge>
                ))}
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2.5 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5" />{error}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview + Edit */}
        {data && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base"><Check className="w-5 h-5 text-green-500" />Product Found</CardTitle>
                  <Badge variant="secondary" className="text-xs">{data.source}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Images */}
                {data.images.length > 0 && (
                  <div className="space-y-2">
                    <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden">
                      <img src={data.images[imgIdx] || data.images[0]} alt="" className="w-full h-full object-contain p-4" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    {data.images.length > 1 && (
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {data.images.map((img, i) => (
                          <button key={i} onClick={() => setImgIdx(i)} className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 ${i === imgIdx ? 'border-orange-500' : 'border-gray-200'}`}>
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Editable fields */}
                <div className="space-y-2.5">
                  <div><Label className="text-xs text-gray-500">Title</Label><Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} /></div>
                  <div><Label className="text-xs text-gray-500">Description</Label><Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={2} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-500">Original Price ($)</Label>
                      <Input type="number" step="0.01" value={data.originalPrice} onChange={(e) => { const o = parseFloat(e.target.value) || 0; setData({ ...data, originalPrice: o, displayPrice: Math.round(o * 1.05 * 100) / 100 }); }} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Display Price (+5% markup)</Label>
                      <Input type="number" step="0.01" value={data.displayPrice} onChange={(e) => setData({ ...data, displayPrice: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs text-gray-500">Category</Label><Input value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })} /></div>
                    <div>
                      <Label className="text-xs text-gray-500">Stock Status</Label>
                      <select value={data.stockStatus} onChange={(e) => setData({ ...data, stockStatus: e.target.value })} className="w-full h-9 px-3 border rounded-md text-sm bg-white">
                        <option>In Stock</option><option>Limited</option><option>Out of Stock</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing formula */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                  <p className="text-[11px] font-medium text-blue-800">Pricing Formula</p>
                  <p className="text-[11px] text-blue-600">
                    Display Price = ${data.originalPrice.toFixed(2)} + (${data.originalPrice.toFixed(2)} × 5%) = <strong>${data.displayPrice.toFixed(2)}</strong>
                  </p>
                </div>

                <div className="flex gap-2.5">
                  <Button variant="outline" className="flex-1" onClick={() => { setData(null); setError(''); }}>Cancel</Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleSave} disabled={saving}>
                    {saving ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Saving...</> : 'Save Product'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* How it works */}
        <Card className="bg-gray-50 border-0">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">How it works</h3>
            <ol className="space-y-2 text-xs text-gray-600">
              {[
                ['1', 'Paste a Daraz or AliExpress product URL'],
                ['2', 'Our scraper fetches title, images, description, and price'],
                ['3', 'Price is auto-marked up by 5% (Original × 1.05)'],
                ['4', 'Review, edit if needed, and save to your store'],
              ].map(([n, t]) => (
                <li key={n} className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold">{n}</span>
                  {t}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
