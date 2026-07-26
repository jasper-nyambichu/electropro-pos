'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { productApi, categoryApi, type ProductRequest, type CategoryResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import ImageUpload from '@/components/ui/ImageUpload';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();
  const id = Number(params.id);

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [productName, setProductName] = useState('');
  const [form, setForm] = useState<ProductRequest>({
    name: '',
    sku: '',
    price: 0,
    costPrice: 0,
    quantity: 0,
    lowStockThreshold: 5,
    barcode: '',
    imageUrl: '',
    categoryId: 0,
  });
  const [originalForm, setOriginalForm] = useState<ProductRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isDirty = originalForm
    ? JSON.stringify(form) !== JSON.stringify(originalForm)
    : false;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [product, cats] = await Promise.all([
          productApi.getById(id),
          categoryApi.getAll(),
        ]);
        setCategories(cats);
        setProductName(product.name);
        const loaded: ProductRequest = {
          name: product.name,
          sku: product.sku,
          price: Number(product.price),
          costPrice: Number((product as unknown as Record<string, unknown>).costPrice ?? 0),
          quantity: product.quantity,
          lowStockThreshold: product.lowStockThreshold,
          barcode: product.barcode || '',
          imageUrl: product.imageUrl || '',
          categoryId: cats.find((c) => c.name === product.categoryName)?.id ?? 0,
        };
        setForm(loaded);
        setOriginalForm(loaded);
      } catch (err: unknown) {
        error('Failed to load product', err instanceof Error ? err.message : undefined);
        router.push('/products');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const set = useCallback(
    <K extends keyof ProductRequest>(key: K, value: ProductRequest[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isDirty) return;
    setSaving(true);
    try {
      await productApi.update(id, form);
      success('Product updated', `${form.name} has been saved.`);
      setOriginalForm(form);
      router.push(`/products/${id}`);
    } catch (err: unknown) {
      error('Update failed', err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await productApi.delete(id);
      success('Product deleted', `${productName} has been removed.`);
      router.push('/products');
    } catch (err: unknown) {
      error('Delete failed', err instanceof Error ? err.message : undefined);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-container_padding animate-pulse">
        <div className="h-8 w-48 bg-outline-variant/20 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] gap-6">
          <div className="h-[500px] bg-outline-variant/10 rounded-lg" />
          <div className="h-[500px] bg-outline-variant/10 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-container_padding">

      {/* ── Header ── */}
      <div className="flex flex-col gap-2 mb-6">
        <nav className="flex items-center gap-2 text-label-sm text-on-surface-variant">
          <span
            onClick={() => router.push('/products')}
            className="hover:text-primary cursor-pointer transition-colors"
          >
            Products
          </span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span
            onClick={() => router.push(`/products/${id}`)}
            className="hover:text-primary cursor-pointer transition-colors"
          >
            {productName}
          </span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold">Edit</span>
        </nav>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/products/${id}`)}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-page-title text-page-title text-on-surface">Edit Product</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-error text-error rounded-lg font-body-semibold hover:bg-error/5 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete Product
            </button>
            <button
              type="submit"
              form="edit-product-form"
              disabled={!isDirty || saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-body-semibold text-sm transition-all ${
                isDirty && !saving
                  ? 'bg-primary text-on-primary hover:brightness-110 shadow-sm'
                  : 'bg-primary/40 text-on-primary cursor-not-allowed'
              }`}
            >
              {saving ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">save</span>
              )}
              {saving ? 'Saving…' : 'Update Product'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Two Column Layout ── */}
      <form id="edit-product-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] gap-6">

          {/* Left — Image */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">

              {/* Large image preview */}
              <div className="relative aspect-square group cursor-pointer bg-surface-container">
                {form.imageUrl ? (
                  <>
                    <img
                      src={form.imageUrl}
                      alt={form.name}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                      <span className="material-symbols-outlined text-3xl">upload</span>
                      <span className="font-body-semibold text-sm">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant/30">
                    <span className="material-symbols-outlined text-6xl">cloud_upload</span>
                    <p className="text-sm">No image — upload one below</p>
                  </div>
                )}
              </div>

              <div className="p-4">
                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {form.imageUrl ? (
                    <div className="aspect-square rounded-lg border-2 border-primary overflow-hidden">
                      <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg border border-outline-variant bg-surface-container-low flex items-center justify-center text-outline">
                      <span className="material-symbols-outlined">add</span>
                    </div>
                  )}
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="aspect-square rounded-lg border border-outline-variant bg-surface-container-low flex items-center justify-center text-outline">
                      <span className="material-symbols-outlined">add</span>
                    </div>
                  ))}
                </div>

                {/* Image upload component */}
                <ImageUpload
                  onUploadComplete={(url) => set('imageUrl', url)}
                  existingUrl={form.imageUrl}
                  label=""
                />
                <p className="text-center text-[10px] text-on-surface-variant/60 mt-2">
                  PNG, JPG or WEBP — max 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Right — Form fields */}
          <div className="flex flex-col gap-5">
            <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm">
              <div className="px-5 py-4 border-b border-outline-variant/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">inventory_2</span>
                <h3 className="font-panel-header text-panel-header">Product Information</h3>
              </div>

              <div className="p-5 space-y-5">

                {/* Product Name */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wide font-semibold text-on-surface-variant mb-1">
                    Product Name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                </div>

                {/* SKU + Barcode */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide font-semibold text-on-surface-variant mb-1">SKU *</label>
                    <input
                      required
                      value={form.sku}
                      onChange={(e) => set('sku', e.target.value)}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide font-semibold text-on-surface-variant mb-1">Barcode</label>
                    <div className="relative">
                      <input
                        value={form.barcode}
                        onChange={(e) => set('barcode', e.target.value)}
                        className="w-full border border-outline-variant rounded-lg pl-3 pr-10 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-2 text-on-surface-variant/40 text-[18px]">
                        barcode_scanner
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wide font-semibold text-on-surface-variant mb-1">Category *</label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => set('categoryId', Number(e.target.value))}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all bg-white"
                  >
                    <option value={0} disabled>Select a category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Price + Cost Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide font-semibold text-on-surface-variant mb-1">Selling Price (KES) *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => set('price', Number(e.target.value))}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide font-semibold text-on-surface-variant mb-1">Cost Price (KES)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.costPrice}
                      onChange={(e) => set('costPrice', Number(e.target.value))}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Quantity stepper + Low Stock Threshold */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide font-semibold text-on-surface-variant mb-1">Quantity *</label>
                    <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => set('quantity', Math.max(0, form.quantity - 1))}
                        className="px-3 py-2 hover:bg-surface-container transition-colors border-r border-outline-variant"
                      >
                        <span className="material-symbols-outlined text-[18px]">remove</span>
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={form.quantity}
                        onChange={(e) => set('quantity', Number(e.target.value))}
                        className="w-full border-none text-center py-2 text-body-reg focus:ring-0 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => set('quantity', form.quantity + 1)}
                        className="px-3 py-2 hover:bg-surface-container transition-colors border-l border-outline-variant"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide font-semibold text-on-surface-variant mb-1">Low Stock Threshold</label>
                    <input
                      type="number"
                      min="0"
                      value={form.lowStockThreshold}
                      onChange={(e) => set('lowStockThreshold', Number(e.target.value))}
                      className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-4 p-4 bg-error-container/20 rounded-lg border border-error/10">
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-error shrink-0">warning</span>
                    <div className="flex-1">
                      <p className="font-body-semibold text-on-surface mb-1">Danger Zone</p>
                      <p className="text-label-sm text-on-surface-variant mb-3">
                        Deleting this product is permanent and cannot be undone. All sales history for this item will be archived.
                      </p>
                      <button
                        type="button"
                        onClick={() => setDeleteOpen(true)}
                        className="px-4 py-2 border border-error text-error rounded-lg font-body-semibold hover:bg-error/5 transition-colors text-sm"
                      >
                        Delete Product
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push(`/products/${id}`)}
                className="px-5 py-2.5 border border-outline-variant text-on-surface-variant rounded-lg font-body-semibold hover:bg-surface-container transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isDirty || saving}
                className={`px-7 py-2.5 rounded-lg font-body-semibold text-sm transition-all flex items-center gap-2 ${
                  isDirty && !saving
                    ? 'bg-primary text-on-primary hover:brightness-110 shadow-sm'
                    : 'bg-primary/40 text-on-primary cursor-not-allowed'
                }`}
              >
                {saving && (
                  <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                )}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <ConfirmModal
        open={deleteOpen}
        title="Delete Product"
        message={`"${productName}" will be permanently removed from your inventory. This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleting}
      />
    </div>
  );
}