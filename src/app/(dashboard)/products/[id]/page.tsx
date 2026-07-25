'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { productApi, type ProductResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function ViewProductPage() {
  const router = useRouter();
  const params = useParams();
  const { error } = useToast();
  const id = Number(params.id);

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    setLoading(true);
    try {
      const data = await productApi.getById(id);
      setProduct(data);
    } catch (err: unknown) {
      error('Failed to load product', err instanceof Error ? err.message : undefined);
      router.push('/products');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-container_padding">
        <p className="text-on-surface-variant">Loading product…</p>
      </div>
    );
  }

  if (!product) return null;

  function stockBadge(p: ProductResponse) {
    if (p.quantity <= 0)
      return <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-error text-on-error">Out of Stock</span>;
    if (p.quantity <= p.lowStockThreshold)
      return <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Low Stock</span>;
    return <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-green-100 text-green-800 border border-green-200">In Stock</span>;
  }

  return (
    <div className="p-container_padding">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/products')}
          className="p-2 hover:bg-surface-container rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <h1 className="font-page-title text-page-title text-on-background">{product.name}</h1>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden max-w-2xl">
        <div className="p-6 flex gap-6">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-32 h-32 rounded-lg object-cover border border-outline-variant/20 shrink-0"
            />
          ) : (
            <div className="w-32 h-32 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-surface-variant/30 text-4xl">image</span>
            </div>
          )}

          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">SKU</p>
              <p className="text-body-reg text-on-surface">{product.sku}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Category</p>
              <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-secondary-container text-on-secondary-container">
                {product.categoryName || '—'}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Price</p>
              <p className="text-body-reg text-on-surface font-semibold">
                KES {Number(product.price).toLocaleString('en-KE')}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Stock</p>
              <div className="flex items-center gap-2">
                <span className="font-body-semibold text-on-surface">{product.quantity}</span>
                {stockBadge(product)}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Low Stock Threshold</p>
              <p className="text-body-reg text-on-surface">{product.lowStockThreshold}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Barcode</p>
              <p className="text-body-reg text-on-surface">{product.barcode || '—'}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/20 flex justify-end">
          <button
            onClick={() => router.push(`/products/edit/${product.id}`)}
            className="px-5 py-2 bg-primary text-on-primary rounded-lg font-body-semibold hover:brightness-110 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Product
          </button>
        </div>
      </div>
    </div>
  );
}