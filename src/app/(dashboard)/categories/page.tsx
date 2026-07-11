"use client";

import { useEffect, useMemo, useState } from "react";
import {
  categoriesApi,
  productsApi,
  ApiError,
  CategoryResponseDto,
  ProductResponseDto,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";

type CategoryColor = "blue" | "red" | "purple" | "amber" | "green" | "slate";
const COLORS: CategoryColor[] = ["blue", "red", "purple", "amber", "green", "slate"];

const COLOR_STYLES: Record<CategoryColor, { header: string; iconBg: string; number: string }> = {
  blue: { header: "bg-blue-50 border-blue-100", iconBg: "bg-blue-600", number: "text-blue-700" },
  red: { header: "bg-red-50 border-red-100", iconBg: "bg-red-600", number: "text-red-700" },
  purple: { header: "bg-purple-50 border-purple-100", iconBg: "bg-purple-600", number: "text-purple-700" },
  amber: { header: "bg-amber-50 border-amber-100", iconBg: "bg-amber-600", number: "text-amber-700" },
  green: { header: "bg-green-50 border-green-100", iconBg: "bg-green-600", number: "text-green-700" },
  slate: { header: "bg-slate-100 border-slate-200", iconBg: "bg-slate-600", number: "text-slate-700" },
};

export default function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [c, p] = await Promise.all([categoriesApi.list(), productsApi.list()]);
      setCategories(c);
      setProducts(p);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const countByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      if (!p.categoryName) continue;
      map.set(p.categoryName, (map.get(p.categoryName) ?? 0) + 1);
    }
    return map;
  }, [products]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await categoriesApi.create({ name: name.trim(), description: description.trim() || undefined });
      setShowForm(false);
      setName("");
      setDescription("");
      toast.success(`Category "${name}" created.`);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not create category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: CategoryResponseDto) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await categoriesApi.remove(c.id);
      setCategories((prev) => prev.filter((x) => x.id !== c.id));
      toast.success(`Category "${c.name}" deleted.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete category.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-page-title font-page-title text-on-background">Categories</h1>
          <nav className="flex text-label-sm text-secondary gap-2 items-center mt-1">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary font-bold">Categories</span>
          </nav>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Category
        </button>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-outline-variant/30 rounded p-4 flex flex-wrap gap-4 items-end shadow-sm">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-label-sm font-body-semibold text-secondary mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full border border-outline-variant/50 rounded py-2 px-3 text-body-reg bg-surface" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-label-sm font-body-semibold text-secondary mb-1">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-outline-variant/50 rounded py-2 px-3 text-body-reg bg-surface" />
          </div>
          <button type="submit" disabled={saving} className="bg-primary text-on-primary px-4 py-2 rounded font-bold text-label-sm disabled:opacity-50">
            {saving ? "Saving…" : "Save Category"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="p-6 text-center text-secondary">Loading categories…</p>
      ) : categories.length === 0 ? (
        <div className="border-2 border-dashed border-outline-variant/30 rounded-lg p-8 flex flex-col items-center justify-center text-secondary opacity-60">
          <p className="font-body-semibold">No categories yet</p>
          <p className="text-label-sm">Create one to start organizing products.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px]">
          {categories.map((cat, i) => {
            const styles = COLOR_STYLES[COLORS[i % COLORS.length]];
            return (
              <div key={cat.id} className="bg-white rounded-lg border border-surface-variant overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col">
                <div className={`flex items-center p-4 border-b ${styles.header}`}>
                  <div className={`w-12 h-12 rounded-lg ${styles.iconBg} flex items-center justify-center text-white mr-4`}>
                    <span className="material-symbols-outlined text-[28px]">category</span>
                  </div>
                  <div>
                    <h3 className="text-panel-header font-panel-header text-on-background">{cat.name}</h3>
                    <p className="text-label-sm text-secondary">{cat.description || "No description"}</p>
                  </div>
                </div>
                <div className="p-4 flex-grow flex items-center justify-between">
                  <div>
                    <span className="text-label-sm text-secondary uppercase font-bold tracking-wider">Inventory</span>
                    <div className={`text-tile-number font-tile-number ${styles.number}`}>
                      {countByCategory.get(cat.name) ?? 0}
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-low px-4 py-2.5 flex justify-end gap-4 border-t border-surface-variant">
                  <button
                    onClick={() => handleDelete(cat)}
                    className="text-label-sm text-error font-bold hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}