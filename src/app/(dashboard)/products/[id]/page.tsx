'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { productApi, saleApi, type ProductResponse, type SaleResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function ViewProductPage() {
  const router = useRouter();
  const params = useParams();
  const { error, success } = useToast();
  const id = Number(params.id);

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([
      productApi.getById(id),
      saleApi.getAll(),
    ])
      .then(([product, allSales]) => {
        setProduct(product);
        setSales(allSales.slice(0, 4));
      })
      .catch((err: unknown) => {
        error('Failed to load product', err instanceof Error ? err.message : undefined);
        router.push('/products');
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!product) return;
    setDeleting(true);
    try {
      await productApi.delete(product.id);
      success('Product deleted', `${product.name} has been removed.`);
      router.push('/products');
    } catch (err: unknown) {
      error('Delete failed', err instanceof Error ? err.message : undefined);
    } finally {
      setDeleting(false);
    }
  }

  const fmt = (n: number) =>
    `KES ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

  function stockColor(p: ProductResponse) {
    if (p.quantity <= 0) return 'text-error';
    if (p.quantity <= p.lowStockThreshold) return 'text-yellow-600';
    return 'text-green-600';
  }

  function stockStatusTile(p: ProductResponse) {
    if (p.quantity <= 0)
      return { label: 'Out of Stock', bg: 'bg-error' };
    if (p.quantity <= p.lowStockThreshold)
      return { label: 'Low Stock', bg: 'bg-yellow-500' };
    return { label: 'In Stock', bg: 'bg-primary' };
  }

  if (loading) {
    return (
      <div className="p-container_padding animate-pulse">
        <div className="h-8 w-48 bg-outline-variant/20 rounded mb-6" />
        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 lg:col-span-5 h-96 bg-outline-variant/10 rounded-lg" />
          <div className="col-span-12 lg:col-span-7 h-96 bg-outline-variant/10 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const { label: stockLabel, bg: stockBg } = stockStatusTile(product);

  return (
    <div className="p-container_padding">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-label-sm text-on-surface-variant mb-6">
        <span
          onClick={() => router.push('/products')}
          className="hover:text-primary cursor-pointer transition-colors"
        >
          Products
        </span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-semibold">{product.name}</span>
      </div>

      <div className="grid grid-cols-12 gap-gutter">

        {/* ── Left Column: Image ── */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-gutter">
          <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/20 overflow-hidden">

            {/* Main image */}
            <div className="aspect-square bg-white overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant/30">
                  <span className="material-symbols-outlined text-6xl">image</span>
                  <p className="text-sm">No image available</p>
                </div>
              )}
            </div>

            {/* Thumbnails + meta */}
            <div className="p-4">
              <div className="grid grid-cols-4 gap-2 mb-4">
                {product.imageUrl ? (
                  <div className="aspect-square rounded border-2 border-primary overflow-hidden">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-square rounded border-2 border-dashed border-outline-variant/30 flex items-center justify-center text-on-surface-variant/40">
                    <span className="material-symbols-outlined text-sm">image</span>
                  </div>
                )}
                {[0, 1, 2].map((i) => (
                  <div key={i} className="aspect-square rounded border-2 border-dashed border-outline-variant/30 flex items-center justify-center text-on-surface-variant/30">
                    <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-sm text-on-surface">SKU: {product.sku}</span>
                {product.barcode && (
                  <span className="text-label-sm text-on-surface-variant/60">Barcode: {product.barcode}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Info ── */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-gutter">
          <div className="bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/20 p-6">

            {/* Name + category */}
            <h1 className="font-page-title text-page-title text-on-background mb-2">{product.name}</h1>
            {product.categoryName && (
              <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider inline-block">
                {product.categoryName}
              </span>
            )}
            <hr className="my-5 border-outline-variant/20" />

            {/* 2×2 stat tiles */}
            <div className="grid grid-cols-2 gap-4 mb-5">

              {/* Selling Price */}
              <div className="bg-secondary-container rounded-lg p-4 relative overflow-hidden">
                <span className="material-symbols-outlined absolute -right-2 -top-2 text-[64px] text-on-secondary-container/10">sell</span>
                <p className="text-label-sm font-semibold text-on-secondary-container/70 uppercase tracking-wide mb-1">Selling Price</p>
                <p className="font-tile-number text-tile-number text-on-secondary-container leading-tight">
                  {fmt(Number(product.price))}
                </p>
              </div>

              {/* Current Stock */}
              <div className="bg-tertiary-container rounded-lg p-4 relative overflow-hidden">
                <span className="material-symbols-outlined absolute -right-2 -top-2 text-[64px] text-on-tertiary-container/10">inventory</span>
                <p className="text-label-sm font-semibold text-on-tertiary-container/70 uppercase tracking-wide mb-1">Current Stock</p>
                <p className={`font-tile-number text-tile-number leading-tight ${stockColor(product)}`}>
                  {product.quantity} Units
                </p>
              </div>

              {/* Threshold */}
              <div className="bg-surface-container-high rounded-lg p-4 relative overflow-hidden">
                <span className="material-symbols-outlined absolute -right-2 -top-2 text-[64px] text-on-surface-variant/10">warning</span>
                <p className="text-label-sm font-semibold text-on-surface-variant/70 uppercase tracking-wide mb-1">Low Stock Threshold</p>
                <p className="font-tile-number text-tile-number text-on-surface leading-tight">
                  {product.lowStockThreshold} Units
                </p>
              </div>

              {/* Stock Status */}
              <div className={`${stockBg} rounded-lg p-4 relative overflow-hidden flex flex-col justify-center`}>
                <span className="material-symbols-outlined absolute -right-2 -top-2 text-[64px] text-white/10">check_circle</span>
                <p className="text-white font-bold text-xl uppercase tracking-widest">{stockLabel}</p>
              </div>
            </div>

            {/* Metadata row */}
            <div className="bg-surface-container rounded-lg p-4 grid grid-cols-2 gap-y-4 mb-5">
              <div>
                <p className="text-label-sm text-on-surface-variant/60 uppercase tracking-wide mb-0.5">SKU</p>
                <p className="font-semibold text-on-surface">{product.sku}</p>
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant/60 uppercase tracking-wide mb-0.5">Barcode</p>
                <p className="font-semibold text-on-surface">{product.barcode || '—'}</p>
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant/60 uppercase tracking-wide mb-0.5">Category</p>
                <p className="font-semibold text-on-surface">{product.categoryName || '—'}</p>
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant/60 uppercase tracking-wide mb-0.5">Last Updated</p>
                <p className="font-semibold text-on-surface">—</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/products')}
                className="flex-1 border border-outline-variant text-on-surface-variant flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-surface-container transition-colors font-semibold text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Products
              </button>
              <button
                onClick={() => router.push(`/products/edit/${product.id}`)}
                className="flex-1 bg-primary text-on-primary flex items-center justify-center gap-2 py-2.5 rounded-lg hover:brightness-110 transition-all font-semibold text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Product
              </button>
            </div>
          </div>
        </div>

        {/* ── Full Width: Recent Sales ── */}
        <div className="col-span-12">
          <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-lg shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">history</span>
              <h2 className="font-panel-header text-panel-header uppercase tracking-wide">Recent Sales History</h2>
            </div>

            {sales.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl opacity-30 block mb-2">receipt_long</span>
                <p className="text-sm">No sales recorded for this product yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low border-b border-outline-variant/10">
                    <tr>
                      <th className="px-5 py-3 font-panel-header text-panel-header text-on-surface-variant">Date</th>
                      <th className="px-5 py-3 font-panel-header text-panel-header text-on-surface-variant">Receipt No</th>
                      <th className="px-5 py-3 font-panel-header text-panel-header text-on-surface-variant">Customer</th>
                      <th className="px-5 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((s, idx) => (
                      <tr
                        key={s.id}
                        className={`border-b border-outline-variant/5 hover:bg-surface-container transition-colors ${idx % 2 === 1 ? 'bg-surface-container-lowest' : ''}`}
                      >
                        <td className="px-5 py-3 text-body-reg text-on-surface-variant">
                          {s.saleDate ? new Date(s.saleDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-5 py-3 font-semibold text-primary">{s.receiptNumber}</td>
                        <td className="px-5 py-3 text-body-reg text-on-surface-variant">{s.customerName || 'Walk-in'}</td>
                        <td className="px-5 py-3 text-right font-bold text-on-surface">
                          {fmt(Number(s.totalAmount || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-4 text-center border-t border-outline-variant/10">
              <button
                onClick={() => router.push('/sales')}
                className="text-primary hover:underline font-semibold text-label-sm"
              >
                View Full Sales Report
              </button>
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        title="Delete Product"
        message={`"${product.name}" will be permanently removed from your inventory. This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleting}
      />
    </div>
  );
}