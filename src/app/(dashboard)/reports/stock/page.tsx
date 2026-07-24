'use client';

import { useEffect, useState } from 'react';
import { reportApi, type ProductResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import TableSkeleton from '@/components/ui/TableSkeleton';
import EmptyState from '@/components/ui/EmptyState';

export default function StockReportPage() {
  const { error } = useToast();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    reportApi.getStock()
      .then(setProducts)
      .catch((err: unknown) => error('Failed to load stock report', err instanceof Error ? err.message : undefined))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.categoryName?.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const totalValue = products.reduce(
    (sum, p) => sum + Number(p.quantity) * Number(p.price), 0
  );

  const fmt = (n: number) =>
    `KES ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

  function statusBadge(p: ProductResponse) {
    if (p.quantity <= 0)
      return <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-error text-on-error">Out of Stock</span>;
    if (p.quantity <= p.lowStockThreshold)
      return <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Low Stock</span>;
    return <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-green-100 text-green-800 border border-green-200">Healthy</span>;
  }

  return (
    <div className="p-container_padding">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Stock Report</h1>
          <p className="text-label-sm text-on-surface-variant mt-0.5">Inventory valuation and stock health</p>
        </div>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-body-semibold hover:bg-surface-container transition-colors self-start">
          <span className="material-symbols-outlined text-[18px]">print</span>
          Export
        </button>
      </div>

      {/* Total stock value banner */}
      {!loading && (
        <div className="bg-primary text-on-primary rounded-lg p-5 mb-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Total Stock Value</p>
            <p className="text-3xl font-bold mt-1">{fmt(totalValue)}</p>
          </div>
          <span className="material-symbols-outlined text-6xl opacity-20">inventory</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm p-4 mb-4">
        <div className="relative max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-[18px]">search</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product or category…"
            className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all" />
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">inventory</span>
          <span className="font-panel-header text-panel-header">Inventory Status — {filtered.length} products</span>
        </div>

        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="inventory" title="No products found" description="Add products to your inventory to see the stock report." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container border-b border-outline-variant/20">
                <tr>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Product</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Category</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Qty</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Unit Price</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Stock Value</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtered.map((p, idx) => (
                  <tr key={p.id}
                    className={`hover:bg-surface-container-low transition-colors ${
                      p.quantity <= 0 ? 'border-l-4 border-error' : p.quantity <= p.lowStockThreshold ? 'border-l-4 border-yellow-400' : ''
                    } ${idx % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-white'}`}>
                    <td className="px-4 py-3 font-body-semibold text-on-surface">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-secondary-container text-on-secondary-container">
                        {p.categoryName || '—'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${p.quantity <= 0 ? 'text-error' : 'text-on-surface'}`}>
                      {p.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface-variant text-body-reg">
                      {fmt(Number(p.price))}
                    </td>
                    <td className="px-4 py-3 text-right font-body-semibold text-on-surface">
                      {fmt(Number(p.quantity) * Number(p.price))}
                    </td>
                    <td className="px-4 py-3 text-center">{statusBadge(p)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-surface-container border-t border-outline-variant/20">
                <tr>
                  <td colSpan={4} className="px-4 py-3 font-bold text-on-surface text-right">Grand Total</td>
                  <td className="px-4 py-3 text-right font-bold text-primary text-lg">{fmt(totalValue)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}