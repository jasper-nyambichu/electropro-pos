"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import PanelCard from "@/components/ui/PanelCard";

interface ProductForm {
  name: string;
  brand: string;
  sku: string;
  category: string;
  stockQty: string;
  costPrice: string;
  sellingPrice: string;
  vat: string;
  warranty: string;
  barcode: string;
  active: boolean;
  featuredOnPos: boolean;
}

const BRANDS = ["Sony", "Samsung", "Apple", "LG"];
const CATEGORIES = [
  "Audio & Headphones",
  "Smartphones",
  "Laptops",
  "Wearables",
];

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProductForm>({
    name: "",
    brand: "",
    sku: "",
    category: "",
    stockQty: "",
    costPrice: "",
    sellingPrice: "",
    vat: "16",
    warranty: "",
    barcode: "",
    active: true,
    featuredOnPos: false,
  });

  // Preview images: first slot is the placeholder headphone image, rest are empty
  const [images, setImages] = useState<(string | null)[]>([
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDCZd_RhjbS8pLzIrRX6WvHUIFacgtqT4e-0sjkDBg4qnE63nSv5CuyJizZqRc8tt7JYvyNX0nH_1WpGlA9rJt5KjOZaAFufW_UoEpkm9Y8nrfJq5CB2ZXAN_qvhfmSYRuSnDZz4nAQtD5u9soMUYVmre0zbzLxY_Kb2hDoWXhBHNJL1chaRXZO0QT43XOOEjWTy-yQFb12Q3lt5MXKU3IsJXYV_dxBWgviubvMcJRG37fJdePoSYxVPV9AHmCO4bM6fkh-BMAfQsMq",
    null,
    null,
  ]);
  const [activeUploadSlot, setActiveUploadSlot] = useState<number | null>(null);

  function handleField<K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || activeUploadSlot === null) return;
    const url = URL.createObjectURL(file);
    setImages((prev) => {
      const next = [...prev];
      next[activeUploadSlot] = url;
      return next;
    });
    setActiveUploadSlot(null);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }

  function triggerUpload(slot: number) {
    setActiveUploadSlot(slot);
    fileInputRef.current?.click();
  }

  function handleDropZoneUpload() {
    // Find first empty slot
    const emptySlot = images.findIndex((img) => img === null);
    if (emptySlot !== -1) {
      triggerUpload(emptySlot);
    } else {
      triggerUpload(0); // replace first if all full
    }
  }

  function handleSave() {
    // Placeholder — wire to your API/action
    console.log("Saving product:", form, images);
  }

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleImageUpload}
      />

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
            className="bg-primary text-on-primary px-6 py-2 rounded-sm text-body-semibold hover:opacity-90 shadow-sm transition-opacity"
          >
            Save Product
          </button>
        </div>
      </div>

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

              {/* Brand */}
              <div>
                <label className="block text-label-sm font-body-semibold text-secondary mb-1">
                  Brand
                </label>
                <select
                  value={form.brand}
                  onChange={(e) => handleField("brand", e.target.value)}
                  className="w-full border border-outline-variant rounded-sm px-3 py-2 text-body-reg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">Select Brand</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
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
                  value={form.category}
                  onChange={(e) => handleField("category", e.target.value)}
                  className="w-full border border-outline-variant rounded-sm px-3 py-2 text-body-reg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
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
                  value={form.stockQty}
                  onChange={(e) => handleField("stockQty", e.target.value)}
                  placeholder="0"
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
                  type="text"
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
                  type="text"
                  value={form.sellingPrice}
                  onChange={(e) => handleField("sellingPrice", e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-outline-variant rounded-sm px-3 py-2 text-body-reg text-on-surface placeholder:text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              {/* VAT */}
              <div>
                <label className="block text-label-sm font-body-semibold text-secondary mb-1">
                  VAT (%)
                </label>
                <input
                  type="text"
                  value={form.vat}
                  onChange={(e) => handleField("vat", e.target.value)}
                  className="w-full border border-outline-variant rounded-sm px-3 py-2 text-body-reg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              {/* Warranty */}
              <div>
                <label className="block text-label-sm font-body-semibold text-secondary mb-1">
                  Warranty
                </label>
                <input
                  type="text"
                  value={form.warranty}
                  onChange={(e) => handleField("warranty", e.target.value)}
                  placeholder="e.g. 12 Months"
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
            </div>
          </PanelCard>
        </div>

        {/* ── Right Column: Media + Status (4/12) ── */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          {/* Product Media */}
          <PanelCard title="Product Media" icon="photo_library">
            <div className="p-5">
              {/* Drop zone */}
              <button
                type="button"
                onClick={handleDropZoneUpload}
                className="w-full border-2 border-dashed border-outline-variant rounded-sm p-6 text-center hover:bg-surface-container transition-colors flex flex-col items-center"
              >
                <span className="material-symbols-outlined text-outline text-[48px] mb-2">
                  cloud_upload
                </span>
                <p className="text-body-semibold text-on-surface">
                  Click to upload product image
                </p>
                <p className="text-label-sm text-secondary">
                  PNG, JPG or WEBP (Max 2MB)
                </p>
              </button>

              {/* Thumbnail grid */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {images.map((src, i) =>
                  src ? (
                    <div
                      key={i}
                      className="aspect-square bg-surface-container rounded-sm border border-outline-variant/30 relative group overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Product image ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-error text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                      </button>
                    </div>
                  ) : (
                    <button
                      key={i}
                      type="button"
                      onClick={() => triggerUpload(i)}
                      className="aspect-square bg-surface-container-low border border-dashed border-outline-variant flex items-center justify-center rounded-sm text-outline hover:bg-surface-container transition-colors"
                      aria-label="Add image"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </PanelCard>

          {/* Product Status */}
          <PanelCard title="Product Status" icon="toggle_on">
            <div className="p-5 space-y-4">
              {/* Active toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-semibold text-on-surface">
                    Active Status
                  </p>
                  <p className="text-[11px] text-secondary">
                    Enable to show on inventory
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => handleField("active", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
                </label>
              </div>

              {/* POS quick access */}
              <div className="flex items-center gap-3 py-2 px-3 bg-primary/5 border border-primary/10 rounded-sm">
                <input
                  type="checkbox"
                  id="featurePos"
                  checked={form.featuredOnPos}
                  onChange={(e) =>
                    handleField("featuredOnPos", e.target.checked)
                  }
                  className="w-4 h-4 text-primary border-outline-variant rounded-sm focus:ring-primary"
                />
                <label
                  htmlFor="featurePos"
                  className="text-body-reg text-on-surface cursor-pointer select-none"
                >
                  Feature on POS Quick Access
                </label>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
    </>
  );
}