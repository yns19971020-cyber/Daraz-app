'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft, Search, Eye, Phone, MapPin, Clock, Package, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface OrderItem {
  id: string;
  productTitle: string;
  productImage: string;
  displayPrice: number;
  quantity: number;
  itemTotal: number;
}
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: string;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  notes: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_CFG: Record<string, { color: string; bg: string }> = {
  Pending:    { color: 'text-yellow-700', bg: 'bg-yellow-100' },
  Confirmed:  { color: 'text-blue-700',   bg: 'bg-blue-100' },
  Shipped:    { color: 'text-purple-700', bg: 'bg-purple-100' },
  Delivered:  { color: 'text-green-700',  bg: 'bg-green-100' },
  Cancelled:  { color: 'text-red-700',    bg: 'bg-red-100' },
};
const ALL_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      const json = await res.json();
      return json.orders as Order[];
    },
    refetchInterval: 8000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Status updated'); },
    onError: () => toast.error('Failed to update'),
  });

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search)
  );

  const totalRev = orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.totalAmount, 0);
  const pending = orders.filter((o) => o.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Store
          </Link>
          <div className="h-5 w-px bg-gray-700" />
          <Link href="/admin/products" className="text-sm text-gray-400 hover:text-white transition-colors mr-4">+ Add Product</Link>
          <h1 className="font-semibold">Order Management</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Orders', value: orders.length, color: 'text-gray-900' },
            { label: 'Pending', value: pending, color: 'text-yellow-600' },
            { label: 'Revenue', value: `$${totalRev.toFixed(2)}`, color: 'text-green-600' },
            { label: 'Delivered', value: orders.filter((o) => o.status === 'Delivered').length, color: 'text-blue-600' },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-sm"><CardContent className="p-4 text-center"><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></CardContent></Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        {/* Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <h3 className="font-medium text-gray-900 mb-1">No Orders Yet</h3>
              <p className="text-sm text-gray-500">Orders will appear here when customers place them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((order) => {
                    const cfg = STATUS_CFG[order.status] || STATUS_CFG.Pending;
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{order.customerName}</p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-0.5"><Phone className="w-3 h-3" />{order.customerPhone}</p>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</TableCell>
                        <TableCell><span className="font-bold text-sm text-red-600">${order.totalAmount.toFixed(2)}</span></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                                {order.status} <ChevronDown className="w-3 h-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {ALL_STATUSES.map((s) => (
                                <DropdownMenuItem key={s} onClick={() => updateStatus.mutate({ id: order.id, status: s })} className={order.status === s ? 'bg-accent' : ''}>
                                  <span className={`w-2 h-2 rounded-full mr-2 ${STATUS_CFG[s].bg.replace('100', '500')}`} />{s}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <p className="text-xs text-gray-500 flex items-center gap-0.5"><Clock className="w-3 h-3" />{new Date(order.createdAt).toLocaleDateString()}</p>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(order)}><Eye className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Order Details</span>
              {selected && <Badge className={`${STATUS_CFG[selected.status]?.bg} ${STATUS_CFG[selected.status]?.color}`}>{selected.status}</Badge>}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs text-gray-500">Order Number</p><p className="font-mono font-bold text-lg">{selected.orderNumber}</p></div>
                <div className="text-right"><p className="text-xs text-gray-500">Date</p><p className="text-sm">{new Date(selected.createdAt).toLocaleString()}</p></div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="bg-gray-50 border-0">
                  <CardContent className="p-3.5">
                    <p className="text-[11px] font-medium text-gray-500 mb-1">Customer</p>
                    <p className="font-semibold text-sm">{selected.customerName}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{selected.customerPhone}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{selected.customerAddress}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50 border-0">
                  <CardContent className="p-3.5">
                    <p className="text-[11px] font-medium text-gray-500 mb-1">Summary</p>
                    <div className="space-y-0.5 text-sm">
                      <div className="flex justify-between"><span>Subtotal</span><span>${selected.subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Delivery</span><span>${selected.deliveryCharge.toFixed(2)}</span></div>
                      <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Total</span><span className="text-red-600">${selected.totalAmount.toFixed(2)}</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <p className="font-semibold text-sm mb-2">Items ({selected.items.length})</p>
                <div className="space-y-2">
                  {selected.items.map((it) => (
                    <div key={it.id} className="flex gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        {it.productImage ? <img src={it.productImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">📦</div>}
                      </div>
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium line-clamp-1">{it.productTitle}</p><p className="text-[10px] text-gray-500">${it.displayPrice.toFixed(2)} × {it.quantity}</p></div>
                      <span className="text-xs font-semibold">${it.itemTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selected.notes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5">
                  <p className="text-[11px] font-medium text-yellow-800 mb-0.5">Notes</p>
                  <p className="text-xs text-yellow-700">{selected.notes}</p>
                </div>
              )}

              <div>
                <p className="font-semibold text-sm mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map((s) => (
                    <Button key={s} variant={selected.status === s ? 'default' : 'outline'} size="sm" className={selected.status === s ? `${STATUS_CFG[s].bg} ${STATUS_CFG[s].color} border-0` : ''} onClick={() => { updateStatus.mutate({ id: selected.id, status: s }); setSelected({ ...selected, status: s }); }}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
