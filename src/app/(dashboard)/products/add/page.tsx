'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi, categoryApi, type CategoryResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import ImageUpload from '@/components/ui/ImageUpload';

export default function AddProductPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const [form, setForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    price: '',
    costPrice: '',
    quantity: '',
    lowStockThreshold: '5',
  });

  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(() => {});
  }, []);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.categoryId) { error('Validation', 'Please select a category.'); return; }
    if (!form.price || !form.costPrice) { error('Validation', 'Price and cost price are required.'); return; }

    setLoading(true);
    try {
      await productApi.create({
        name: form.name,
        sku: form.sku,
        barcode: form.barcode,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        costPrice: Number(form.costPrice),
        quantity: Number(form.quantity) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 5,
        imageUrl,
      });
      success('Product created', `${form.name} has been added to inventory.`);
      router.push('/products');
    } catch (err: unknown) {
      error('Failed to create product', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-container_padding">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-surface-container rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Add New Product</h1>
          <nav className="flex text-label-sm text-on-surface-variant gap-1 mt-0.5">
            <span className="hover:text-primary cursor-pointer" onClick={() => router.push('/products')}>Products</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-semibold">Add Product</span>
          </nav>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">inventory_2</span>
            <span className="font-panel-header text-panel-header">Product Details</span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left — image upload */}
              <div>
                <ImageUpload onUploadComplete={setImageUrl} existingUrl={imageUrl} />
              </div>

              {/* Right — form fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Product Name *</label>
                  <input required value={form.name} onChange={(e) => set('name', e.target.value)}
                    placeholder="e.g. Samsung 55 inch UHD Smart TV"
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">SKU *</label>
                    <input required value={form.sku} onChange={(e) => set('sku', e.target.value)}
                      placeholder="SKU-TV-001"
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Barcode</label>
                    <div className="relative">
                      <input value={form.barcode} onChange={(e) => set('barcode', e.target.value)}
                        placeholder="Scan or enter"
                        className="w-full border border-outline-variant rounded-lg pl-3 pr-10 py-2 text-body-reg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40 text-[18px]">barcode_scanner</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Category *</label>
                  <select required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all">
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Selling Price (KES) *</label>
                    <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)}
                      placeholder="0.00"
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Cost Price (KES) *</label>
                    <input required type="number" min="0" step="0.01" value={form.costPrice} onChange={(e) => set('costPrice', e.target.value)}
                      placeholder="0.00"
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Quantity</label>
                    <input type="number" min="0" value={form.quantity} onChange={(e) => set('quantity', e.target.value)}
                      placeholder="0"
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Low Stock Threshold</label>
                    <input type="number" min="0" value={form.lowStockThreshold} onChange={(e) => set('lowStockThreshold', e.target.value)}
                      placeholder="5"
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-outline-variant/20 flex justify-end gap-3">
              <button type="button" onClick={() => router.back()}
                className="px-6 py-2.5 border border-outline-variant text-on-surface-variant rounded-lg font-body-semibold hover:bg-surface-container transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="px-8 py-2.5 bg-primary text-on-primary rounded-lg font-body-semibold hover:brightness-110 transition-all shadow-sm flex items-center gap-2 disabled:opacity-60">
                {loading && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
                {loading ? 'Saving…' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}