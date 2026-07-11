"use client";

import { useEffect, useMemo, useState } from "react";
import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";
import { productsApi, ApiError, ProductResponseDto } from "@/lib/api";

const PALETTE = ["#2980B9", "#E74C3C", "#8E44AD", "#E6B800", "#27AE60", "#16A085", "#D35400"];

export default function StockReportPage() {
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    productsApi
      .list()
      .then(setProducts)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load stock report."))
      .finally(() => setLoading(false));
  }, []);

  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold).length;
  const outOfStockCount = products.filter((p) => p.quantity <= 0).length;

  const categoryValues = useMemo(() => {
    const totals = new Map<string, number>();
    for (const p of products) {
      const key = p.categoryName ?? "Uncategorized";
      totals.set(key, (totals.get(key) ?? 0) + p.price * p.quantity);
    }
    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }));
  }, [products]);

  const filtered = products.filter(
    (p) =>
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<ProductResponseDto>[] = [
    {
      header: "Product",
      render: (p) => (
        <span className={`font-body-semibold ${p.quantity <= 0 ? "text-error" : ""}`}>{p.name}</span>
      ),
    },
    { header: "SKU", render: (p) => <span className="font-mono text-[12px] text-secondary">{p.sku}</span> },
    { header: "Category", render: (p) => p.categoryName ?? "Uncategorized" },
    {
      header: "Current Stock",
      align: "right",
      render: (p) =>
        p.quantity <= p.lowStockThreshold ? (
          <span className="text-error font-bold">{p.quantity}</span>
        ) : (
          p.quantity
        ),
    },
    { header: "Unit Price", align: "right", render: (p) => p.price.toLocaleString() },
    { header: "Total Value", align: "right", render: (p) => <span className="font-body-semibold">{(p.price * p.quantity).toLocaleString()}</span> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">Stock Report</h1>
          <p className="text-secondary font-body-reg">Detailed inventory analytics and stock health status.</p>
        </div>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[15px]">
        <div className="bg-[#00c0ef] text-white rounded-sm overflow-hidden relative shadow-sm h-24 flex flex-col justify-center">
          <div className="p-4 relative z-10">
            <h3 className="font-tile-number text-tile-number">{products.length}</h3>
            <p className="font-body-reg opacity-90">Total Products</p>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-2 text-[60px] opacity-20 select-none">inventory_2</span>
        </div>
        <div className="bg-[#00a65a] text-white rounded-sm overflow-hidden relative shadow-sm h-24 flex flex-col justify-center">
          <div className="p-4 relative z-10">
            <h3 className="font-tile-number text-tile-number">KES {Math.round(totalValue).toLocaleString()}</h3>
            <p className="font-body-reg opacity-90">Stock Value</p>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-2 text-[60px] opacity-20 select-none">payments</span>
        </div>
        <div className="bg-[#f39c12] text-white rounded-sm overflow-hidden relative shadow-sm h-24 flex flex-col justify-center">
          <div className="p-4 relative z-10">
            <h3 className="font-tile-number text-tile-number">{lowStockCount}</h3>
            <p className="font-body-reg opacity-90">Low Stock</p>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-2 text-[60px] opacity-20 select-none">warning</span>
        </div>
        <div className="bg-[#dd4b39] text-white rounded-sm overflow-hidden relative shadow-sm h-24 flex flex-col justify-center">
          <div className="p-4 relative z-10">
            <h3 className="font-tile-number text-tile-number">{outOfStockCount}</h3>
            <p className="font-body-reg opacity-90">Out of Stock</p>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-2 text-[60px] opacity-20 select-none">error</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[15px]">
        <div className="lg:col-span-4">
          <PanelCard title="Stock Value by Category" icon="pie_chart">
            <div className="p-5">
              {categoryValues.length === 0 ? (
                <p className="text-center text-secondary">No stock data yet.</p>
              ) : (
                <div className="w-full space-y-2">
                  {categoryValues.map((c) => (
                    <div key={c.label} className="flex justify-between items-center text-label-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></span>
                        <span>{c.label}</span>
                      </div>
                      <span className="font-body-semibold">KES {Math.round(c.value).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PanelCard>
        </div>

        <div className="lg:col-span-8">
          <PanelCard
            title="Inventory Status"
            icon="list_alt"
            headerExtra={
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-outline-variant text-[12px] px-2 py-1 rounded-sm w-40 focus:ring-1 focus:ring-primary"
                placeholder="Filter products..."
                type="text"
              />
            }
          >
            {loading ? (
              <p className="p-6 text-center text-secondary">Loading…</p>
            ) : (
              <DataTable columns={columns} rows={filtered} rowKey={(p) => String(p.id)} />
            )}
          </PanelCard>
        </div>
      </div>
    </div>
  );
}