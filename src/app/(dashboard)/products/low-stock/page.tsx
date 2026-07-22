'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi, type ProductResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import TableSkeleton from '@/components/ui/TableSkeleton';
import EmptyState from '@/components/ui/EmptyState';

export default function LowStockPage() {
  const router = useRouter();
  const { error } = useToast();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi.getLowStock()
      .then(setProducts)
      .catch((err: unknown) => error('Failed to load', err instanceof Error ? err.message : undefined))
      .finally(() => setLoading(false));
  }, []);

  function urgencyBadge(p: ProductResponse) {
    if (p.quantity <= 0)
      return <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-error text-on-error">Out of Stock</span>;
    return <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Low Stock</span>;
  }

  return (
    <div className="p-container_padding">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface-container rounded-lg transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Low Stock Alerts</h1>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            {products.length} product{products.length !== 1 ? 's' : ''} need restocking
          </p>
        </div>
      </div>

      {!loading && products.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-yellow-600 shrink-0">warning</span>
          <div>
            <p className="font-semibold text-yellow-800 text-sm">Stock Alert</p>
            <p className="text-yellow-700 text-xs mt-0.5">
              {products.filter((p) => p.quantity <= 0).length} products are out of stock.{' '}
              {products.filter((p) => p.quantity > 0).length} are below their reorder threshold.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-600 text-[18px]">warning</span>
          <span className="font-panel-header text-panel-header">Products Requiring Attention</span>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : products.length === 0 ? (
          <EmptyState
            icon="check_circle"
            title="All products are well stocked"
            description="No products are currently below their reorder threshold. Great job!"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container border-b border-outline-variant/20">
                <tr>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Product</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Category</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-center">Current Stock</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-center">Threshold</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-center">Status</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {products.map((p, idx) => (
                  <tr key={p.id}
                    className={`hover:bg-surface-container-low transition-colors ${idx % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-white'} ${p.quantity <= 0 ? 'border-l-4 border-error' : 'border-l-4 border-yellow-400'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded object-cover border border-outline-variant/20 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-on-surface-variant/30 text-xl">image</span>
                          </div>
                        )}
                        <div>
                          <p className="font-body-semibold text-on-surface">{p.name}</p>
                          <p className="text-label-sm text-on-surface-variant">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-secondary-container text-on-secondary-container">
                        {p.categoryName || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-error">{p.quantity}</td>
                    <td className="px-4 py-3 text-center text-on-surface-variant">{p.lowStockThreshold}</td>
                    <td className="px-4 py-3 text-center">{urgencyBadge(p)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => router.push(`/products/edit/${p.id}`)}
                        className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:brightness-110 transition-all"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}