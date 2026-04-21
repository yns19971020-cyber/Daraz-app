'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Link2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Store,
  ArrowLeft,
  ImageIcon,
  Package,
  DollarSign,
  Save,
  RotateCcw,
  ChevronRight,
  Globe,
  Pencil,
  Eye,
  Camera,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ─────────────────────────────────────────
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

// ── Animation variants ────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: 'easeOut' as const },
};

// ── Component ─────────────────────────────────────
export default function AdminAddProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── State ──
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<ScrapedProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [editMode, setEditMode] = useState(false);

  // ── Fetch recent products count ──
  const { data: productCount } = useQuery({
    queryKey: ['products-count'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      const json = await res.json();
      return json.products?.length ?? 0;
    },
    staleTime: 60000,
  });

  // ── Auto-detect paste ──
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const pasted = e.clipboardData?.getData('text');
      if (pasted && (pasted.includes('daraz') || pasted.includes('aliexpress'))) {
        setUrl(pasted);
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, []);

  // ── Scrape handler ──
  const handleScrape = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a product URL');
      return;
    }

    // Validate URL pattern
    if (!trimmed.includes('daraz') && !trimmed.includes('aliexpress')) {
      setError('Please enter a valid Daraz or AliExpress product URL');
      return;
    }

    setLoading(true);
    setError('');
    setData(null);
    setImgIdx(0);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      const json = await res.json();

      if (json.success && json.product) {
        setData(json.product);
        setEditMode(false);
        toast.success('Product fetched successfully!', {
          description: `"${json.product.title.slice(0, 50)}..."`,
        });
      } else {
        setError(json.error || 'Failed to scrape product. Please check the URL.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [url]);

  // ── Save handler ──
  const handleSave = useCallback(async () => {
    if (!data) return;
    setSaving(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (json.success) {
        toast.success('Product saved to store!', {
          description: `"${data.title.slice(0, 60)}" has been added successfully.`,
          duration: 4000,
        });
        // Clear everything for next product
        setData(null);
        setUrl('');
        setError('');
        setImgIdx(0);
        setEditMode(false);
        // Refresh product lists
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['products-count'] });
      } else {
        toast.error('Failed to save product', {
          description: json.error || 'Unknown error occurred.',
        });
      }
    } catch {
      toast.error('Network error', { description: 'Could not save the product.' });
    } finally {
      setSaving(false);
    }
  }, [data, queryClient]);

  // ── Reset ──
  const handleReset = () => {
    setData(null);
    setUrl('');
    setError('');
    setImgIdx(0);
    setEditMode(false);
  };

  // ── Computed ──
  const markupAmount = data
    ? Math.round((data.displayPrice - data.originalPrice) * 100) / 100
    : 0;
  const markupPercent = 5;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Admin sub-header ── */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-sm font-medium text-gray-900">Add Product</span>
          {productCount !== undefined && (
            <Badge variant="secondary" className="text-[10px] ml-auto">
              {productCount} products in store
            </Badge>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
        {/* ── URL Input Card ── */}
        <motion.div {...fadeUp}>
          <Card className="border-0 shadow-md overflow-hidden">
            {/* Accent bar */}
            <div className="h-1 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400" />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    Import from URL
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Paste a Daraz or AliExpress product URL to auto-import title,
                    images, price &amp; description.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Input row */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <Input
                    placeholder="https://www.daraz.lk/products/..."
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (error) setError('');
                    }}
                    className="pl-9 h-11 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading) handleScrape();
                    }}
                    disabled={loading}
                  />
                </div>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-11 px-6 font-medium shadow-sm"
                  onClick={handleScrape}
                  disabled={loading || !url.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      <span>Fetch Product</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Supported sources */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                  Supported:
                </span>
                {[
                  { name: 'Daraz', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { name: 'AliExpress', color: 'bg-red-50 text-red-700 border-red-200' },
                ].map((s) => (
                  <Badge
                    key={s.name}
                    variant="outline"
                    className={`text-[11px] font-medium border ${s.color}`}
                  >
                    <Globe className="w-3 h-3 mr-1" />
                    {s.name}
                  </Badge>
                ))}
              </div>

              {/* Error display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Loading Skeleton ── */}
        <AnimatePresence>
          {loading && (
            <motion.div {...fadeUp}>
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                    <CardTitle className="text-sm text-gray-600">
                      Scraping product data...
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Skeleton className="aspect-square w-full rounded-lg" />
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map((i) => (
                          <Skeleton key={i} className="w-14 h-14 rounded" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="pt-2 space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-10 w-full mt-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Product Preview ── */}
        <AnimatePresence>
          {data && !loading && (
            <motion.div {...fadeUp}>
              <Card className="border-0 shadow-md overflow-hidden">
                {/* Green accent bar on success */}
                <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <CardTitle className="text-lg">Product Found</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[11px] font-medium bg-orange-50 text-orange-700 border-orange-200"
                      >
                        <Store className="w-3 h-3 mr-1" />
                        {data.source === 'daraz' ? 'Daraz' : 'AliExpress'}
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">
                        {data.category}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    Review the product details below. You can edit fields before saving.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="grid md:grid-cols-5 gap-6">
                    {/* ── Left: Image Gallery (2 cols) ── */}
                    <div className="md:col-span-2 space-y-3">
                      {/* Main image */}
                      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                        {data.images.length > 0 ? (
                          <img
                            src={data.images[imgIdx] || data.images[0]}
                            alt={data.title}
                            className="w-full h-full object-contain p-3"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.display = 'none';
                              img.parentElement!.innerHTML =
                                '<div class="flex items-center justify-center h-full text-gray-400"><svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg><p class="text-sm mt-1">Image not available</p></div>';
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ImageIcon className="w-12 h-12 mb-1" />
                            <p className="text-sm">No images available</p>
                          </div>
                        )}
                      </div>

                      {/* Thumbnails */}
                      {data.images.length > 1 && (
                        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                          {data.images.map((img, i) => (
                            <button
                              key={i}
                              onClick={() => setImgIdx(i)}
                              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                                i === imgIdx
                                  ? 'border-orange-500 ring-2 ring-orange-200 shadow-sm'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={img}
                                alt={`Thumbnail ${i + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).parentElement!.style.display =
                                    'none';
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      <p className="text-[11px] text-gray-400 text-center">
                        {data.images.length} image{data.images.length !== 1 ? 's' : ''} found
                      </p>
                    </div>

                    {/* ── Right: Product details (3 cols) ── */}
                    <div className="md:col-span-3 space-y-4">
                      {/* Edit mode toggle */}
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-gray-500 h-7"
                          onClick={() => setEditMode(!editMode)}
                        >
                          {editMode ? (
                            <>
                              <Eye className="w-3.5 h-3.5 mr-1" /> Preview Mode
                            </>
                          ) : (
                            <>
                              <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Mode
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Title */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Package className="w-3 h-3" /> Title
                        </Label>
                        {editMode ? (
                          <Input
                            value={data.title}
                            onChange={(e) =>
                              setData({ ...data, title: e.target.value })
                            }
                            className="text-sm"
                          />
                        ) : (
                          <h2 className="text-base font-semibold text-gray-900 leading-snug">
                            {data.title}
                          </h2>
                        )}
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500 font-medium">
                          Description
                        </Label>
                        {editMode ? (
                          <Textarea
                            value={data.description}
                            onChange={(e) =>
                              setData({ ...data, description: e.target.value })
                            }
                            rows={3}
                            className="text-sm"
                          />
                        ) : (
                          <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">
                            {data.description || (
                              <span className="italic text-gray-400">
                                No description available
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* Prices */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> Original Price
                          </Label>
                          {editMode ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={data.originalPrice}
                              onChange={(e) => {
                                const o = parseFloat(e.target.value) || 0;
                                setData({
                                  ...data,
                                  originalPrice: o,
                                  displayPrice:
                                    Math.round(o * 1.05 * 100) / 100,
                                });
                              }}
                              className="text-sm font-mono"
                            />
                          ) : (
                            <p className="text-xl font-bold text-gray-900 font-mono">
                              ${data.originalPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Display Price
                          </Label>
                          {editMode ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={data.displayPrice}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  displayPrice: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="text-sm font-mono"
                            />
                          ) : (
                            <p className="text-xl font-bold text-orange-600 font-mono">
                              ${data.displayPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Pricing breakdown */}
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-3.5 space-y-2">
                        <p className="text-xs font-semibold text-orange-800 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Price Breakdown
                        </p>
                        <div className="flex items-baseline gap-1.5 text-xs text-orange-700">
                          <span>${data.originalPrice.toFixed(2)}</span>
                          <span className="text-orange-400">+</span>
                          <span>
                            ${data.originalPrice.toFixed(2)} &times; {markupPercent}%
                          </span>
                          <span className="text-orange-400">=</span>
                          <span className="text-base font-bold text-orange-900">
                            ${data.displayPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-700 text-[10px] border-0">
                            +${markupAmount.toFixed(2)} profit per unit
                          </Badge>
                        </div>
                      </div>

                      {/* Category + Stock */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-500 font-medium">
                            Category
                          </Label>
                          {editMode ? (
                            <Input
                              value={data.category}
                              onChange={(e) =>
                                setData({ ...data, category: e.target.value })
                              }
                              className="text-sm"
                            />
                          ) : (
                            <Badge variant="secondary" className="text-sm">
                              {data.category}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-gray-500 font-medium">
                            Stock Status
                          </Label>
                          {editMode ? (
                            <select
                              value={data.stockStatus}
                              onChange={(e) =>
                                setData({ ...data, stockStatus: e.target.value })
                              }
                              className="w-full h-9 px-3 border rounded-md text-sm bg-white"
                            >
                              <option value="In Stock">In Stock</option>
                              <option value="Limited">Limited</option>
                              <option value="Out of Stock">Out of Stock</option>
                            </select>
                          ) : (
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium ${
                                data.stockStatus === 'In Stock'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : data.stockStatus === 'Limited'
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {data.stockStatus === 'In Stock' && (
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                              )}
                              {data.stockStatus}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Source URL */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Source URL
                        </Label>
                        <a
                          href={data.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate block"
                        >
                          {data.sourceUrl}
                        </a>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* ── Action buttons ── */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-11"
                      onClick={handleReset}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear &amp; Add Another
                    </Button>
                    <Button
                      className="flex-1 h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium shadow-sm"
                      onClick={handleSave}
                      disabled={saving || !data.title}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving to Store...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save to Store
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── How it works ── */}
        {!data && !loading && (
          <motion.div {...fadeUp}>
            <Card className="bg-white border-0 shadow-md overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-500" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      step: '1',
                      title: 'Paste URL',
                      desc: 'Copy a product link from Daraz or AliExpress and paste it above.',
                      icon: <Link2 className="w-5 h-5 text-orange-500" />,
                      bg: 'bg-orange-50',
                    },
                    {
                      step: '2',
                      title: 'Auto-Scrape',
                      desc: 'Our scraper fetches the title, images, description, and original price.',
                      icon: <Camera className="w-5 h-5 text-red-500" />,
                      bg: 'bg-red-50',
                    },
                    {
                      step: '3',
                      title: 'Review & Edit',
                      desc: 'Preview the product data. Toggle edit mode to adjust any field before saving.',
                      icon: <Pencil className="w-5 h-5 text-blue-500" />,
                      bg: 'bg-blue-50',
                    },
                    {
                      step: '4',
                      title: 'Save to Store',
                      desc: 'Click "Save to Store" to add the product. The form clears automatically for the next import.',
                      icon: <Save className="w-5 h-5 text-green-500" />,
                      bg: 'bg-green-50',
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}
                      >
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Step {item.step}
                      </span>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Quick links ── */}
        <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.1 }}>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link href="/products">
                <Store className="w-4 h-4 mr-1.5" />
                Browse Store
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/orders">
                <Package className="w-4 h-4 mr-1.5" />
                Manage Orders
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/products">
                <Pencil className="w-4 h-4 mr-1.5" />
                Product List
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
