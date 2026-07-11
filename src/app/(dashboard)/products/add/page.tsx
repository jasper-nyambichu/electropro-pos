"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PanelCard from "@/components/ui/PanelCard";
import {
  categoriesApi,
  productsApi,
  ApiError,
  CategoryResponseDto,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface ProductForm {
  name: string;
  sku: string;
  categoryId: string;
  stockQty: string;
  lowStockThreshold: string;
  costPrice: string;
  sellingPrice: string;
  barcode: string;
  imageUrl: string;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  sku: "",
  categoryId: "",
  stockQty: "",
  lowStockThreshold: "5",
  costPrice: "",
  sellingPrice: "",
  barcode: "",
  imageUrl: "",
};

export default function AddProductPage() {
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {
      // categories are optional on the form; a load failure just means
      // the dropdown is empty and the product is saved uncategorized
    });
  }, []);

  function handleField<K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setError(null);

    if (!form.name.trim() || !form.sku.trim() || !form.sellingPrice) {
      setError("Name, SKU, and Selling Price are required.");
      return;
    }

    setSaving(true);
    try {
      const created = await productsApi.create({
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.sellingPrice),
        costPrice: Number(form.costPrice || 0),
        quantity: Number(form.stockQty || 0),
        lowStockThreshold: Number(form.lowStockThreshold || 0),
        barcode: form.barcode.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      });
      toast.success(`"${created.name}" was added to inventory.`);
      router.push("/products");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? `Could not save product: ${err.message}`
          : "Could not save product. Check your connection to the server.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">
            Add New Product
          </h1>
          <p className="text-label-sm text-secondary">
            Create a new item in your electronics inventory.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="bg-surface-variant text-on-surface border border-outline-variant px-4 py-2 rounded-sm text-body-semibold hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-on-primary px-6 py-2 rounded-sm text-body-semibold hover:opacity-90 shadow-sm transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Product"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 mb-4 text-label-sm">
          {error}
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* ── Left Column: Product Information (8/12) ── */}
        <div className="lg:col-span-8">
          <PanelCard title="Product Information" icon="info">
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Product Name — full width */}
              <div className="md:col-span-2">
                <label className="block text-label-sm font-body-semibold text-secondary mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleField("name", e.target.value)}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  className="w-full border border-outline-variant rounded-sm px-3 py-2 text-body-reg text-on-surface placeholder:text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-label-sm font-body-semibold text-secondary mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => handleField("sku", e.target.value)}
                  placeholder="SNY-WH-XM5-BLK"
                  className="w-full border border-outline-variant rounded-sm px-3 py-2 text-body-reg text-on-surface placeholder:text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-label-sm font-body-semibold text-secondary mb-1">
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => handleField("categoryId", e.target.value)}
                  className="w-full border border-outline-variant rounded-sm px-3 py-2 text-body-reg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Qty */}
              <div>
                <label className="block text-label-sm font-body-semibold text-secondary mb-1">
                  Stock Qty
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.stockQty}
                  onChange={(e) => handleField("stockQty", e.target.value)}
                  placeholder="0"
                  className="w-full border border-outline-variant rounded-sm px-3 py-2 text-body-reg text-on-surface placeholder:text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              {/* Low stock threshold */}
              <div>
                <label className="block text-label-sm font-body-semibold text-secondary mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.lowStockThreshold}
                  onChange={(e) => handleField("lowStockThreshold", e.target.value)}
                  placeholder="5"
                  className="w-full border border-outline-variant rounded-sm px-3 py-2 text-body-reg text-on-surface placeholder:text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              {/* Divider */}
              <div className="md:col-span-2 border-t border-outline-variant/20" />

              {/* Cost Price */}
              <div>
                <label className="block text-label-sm font-body-semibold text-secondary mb-1">
                  Cost Price (KES)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.costPrice}
                  onChange={(e) => handleField("costPrice", e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-outline-variant rounded-sm px-3 py-2 text-body-reg text-on-surface placeholder:text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-label-sm font-body-semibold text-secondary mb-1">
                  Selling Price (KES)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.sellingPrice}
                  onChange={(e) => handleField("sellingPrice", e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-outline-variant rounded-sm px-3 py-2 text-body-reg text-on-surface placeholder:text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              {/* Barcode — full width */}
              <div className="md:col-span-2">
                <label className="block text-label-sm font-body-semibold text-secondary mb-1">
                  Barcode
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={(e) => handleField("barcode", e.target.value)}
                    placeholder="Scan or enter barcode"
                    className="w-full border border-outline-variant rounded-sm pl-3 pr-10 py-2 text-body-reg text-on-surface placeholder:text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <span className="material-symbols-outlined absolute right-3 top-2 text-secondary text-[20px] pointer-events-none">
                    barcode_scanner
                  </span>
                </div>
              </div>

              {/* Image URL — full width */}
              <div className="md:col-span-2">
                <label className="block text-label-sm font-body-semibold text-secondary mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => handleField("imageUrl", e.target.value)}
                  placeholder="https://…"
                  className="w-full border border-outline-variant rounded-sm px-3 py-2 text-body-reg text-on-surface placeholder:text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
                <p className="text-[11px] text-secondary mt-1">
                  The backend stores a URL, not an uploaded file — paste a hosted image link.
                </p>
              </div>
            </div>
          </PanelCard>
        </div>

        {/* ── Right Column: Preview (4/12) ── */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <PanelCard title="Preview" icon="visibility">
            <div className="p-5">
              <div className="aspect-square bg-surface-container rounded-sm border border-outline-variant/30 overflow-hidden flex items-center justify-center">
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.imageUrl}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="material-symbols-outlined text-outline-variant text-[64px]">
                    inventory_2
                  </span>
                )}
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-body-semibold text-on-surface">
                  {form.name || "Product name"}
                </p>
                <p className="text-primary font-bold">
                  KES {Number(form.sellingPrice || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
    </>
  );
}