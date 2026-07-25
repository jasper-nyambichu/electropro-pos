'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { productApi, categoryApi, type ProductRequest, type CategoryResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();
  const id = Number(params.id);

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [form, setForm] = useState<ProductRequest>({
    name: '',
    sku: '',
    price: 0,
    costPrice: 0,
    quantity: 0,
    lowStockThreshold: 0,
    barcode: '',
    imageUrl: '',
    categoryId: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    try {
      const [product, cats] = await Promise.all([
        productApi.getById(id),
        categoryApi.getAll(),
      ]);
      setCategories(cats);
      setForm({
        name: product.name,
        sku: product.sku,
        price: product.price,
        costPrice: (product as any).costPrice ?? 0,
        quantity: product.quantity,
        lowStockThreshold: product.lowStockThreshold,
        barcode: product.barcode || '',
        imageUrl: product.imageUrl || '',
        categoryId:
          cats.find((c) => c.name === product.categoryName)?.id ?? 0,
      });
    } catch (err: unknown) {
      error('Failed to load product', err instanceof Error ? err.message : undefined);
      router.push('/products');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await productApi.update(id, form);
      success('Product updated', `${form.name} has been updated.`);
      router.push('/products');
    } catch (err: unknown) {
      error('Update failed', err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-container_padding">
        <p className="text-on-surface-variant">Loading product…</p>
      </div>
    );
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
        <h1 className="font-page-title text-page-title text-on-background">Edit Product</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-outline-variant/30 rounded-lg shadow-sm p-6 max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">SKU *</label>
          <input
            required
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Barcode</label>
          <input
            value={form.barcode}
            onChange={(e) => setForm({ ...form, barcode: e.target.value })}
            placeholder="Optional"
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Price (KES) *</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Cost Price (KES)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.costPrice}
            onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Quantity *</label>
          <input
            required
            type="number"
            min="0"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Low Stock Threshold</label>
          <input
            type="number"
            min="0"
            value={form.lowStockThreshold}
            onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Category *</label>
          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
            className="w-full h-10 border border-outline-variant rounded-lg px-3 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all bg-white"
          >
            <option value={0} disabled>Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Image URL</label>
          <input
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://…"
            className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="md:col-span-2 flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="px-5 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-body-semibold hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-on-primary rounded-lg font-body-semibold hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {saving && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}