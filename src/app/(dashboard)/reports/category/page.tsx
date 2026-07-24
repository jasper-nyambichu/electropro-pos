"use client";

import { useEffect, useMemo, useState } from "react";
import PanelCard from "@/components/ui/PanelCard";
import DataTable, { Column } from "@/components/ui/DataTable";
import {
  categoryApi,
  productApi,
  saleApi,
  ApiError,
  CategoryResponse,
  ProductResponse,
  SaleResponse,
} from "@/lib/api";

const PALETTE = ["#2980B9", "#E74C3C", "#8E44AD", "#E6B800", "#27AE60", "#16A085", "#D35400"];

interface CategoryStat {
  category: string;
  color: string;
  unitsSold: number;
  revenue: number;
  percentage: number;
  avgSale: number;
}

export default function CategoryReportPage() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([categoryApi.getAll(), productApi.getAll(), saleApi.getAll()])
      .then(([c, p, s]) => {
        setCategories(c);
        setProducts(p);
        setSales(s.filter((sale: SaleResponse) => sale.status !== "REFUNDED"));
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load report data."))
      .finally(() => setLoading(false));
  }, []);

  const stats: CategoryStat[] = useMemo(() => {
    const categoryByProductId = new Map<number, string>();
    for (const p of products) {
      categoryByProductId.set(p.id, p.categoryName ?? "Uncategorized");
    }

    const totals = new Map<string, { units: number; revenue: number }>();

    for (const sale of sales) {
      for (const item of sale.items) {
        const productId = (item as any).productId ?? (item as any).product_id ?? (item as any).product?.id;
        const key = categoryByProductId.get(productId) ?? "Uncategorized";
        const existing = totals.get(key) ?? { units: 0, revenue: 0 };
        existing.units += item.quantity;
        existing.revenue += item.subtotal;
        totals.set(key, existing);
      }
    }

    const grandTotal = Array.from(totals.values()).reduce((s, v) => s + v.revenue, 0) || 1;

    return Array.from(totals.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .map(([category, v], i) => ({
        category,
        color: PALETTE[i % PALETTE.length],
        unitsSold: v.units,
        revenue: v.revenue,
        percentage: Math.round((v.revenue / grandTotal) * 100),
        avgSale: v.units ? v.revenue / v.units : 0,
      }));
  }, [products, sales]);

  const columns: Column<CategoryStat>[] = [
    {
      header: "Category",
      render: (s) => (
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }}></span>
          <span className="font-body-semibold">{s.category}</span>
        </div>
      ),
    },
    { header: "Units Sold", align: "center", render: (s) => s.unitsSold },
    { header: "Revenue (KES)", render: (s) => <span className="font-body-semibold text-primary">{s.revenue.toLocaleString()}</span> },
    {
      header: "% of Total Revenue",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${s.percentage}%`, backgroundColor: s.color }} />
          </div>
          <span className="text-[12px] font-bold w-8 text-right" style={{ color: s.color }}>{s.percentage}%</span>
        </div>
      ),
    },
    { header: "Avg Sale Value", render: (s) => `KES ${Math.round(s.avgSale).toLocaleString()}` },
  ];

  return (
    <div className="flex flex-col gap-[15px]">
      <div>
        <h1 className="text-page-title font-page-title text-on-background">Sales by Category</h1>
        <p className="text-secondary text-label-sm">
          Revenue breakdown across {categories.length} registered categories
        </p>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm">{error}</div>
      )}

      {loading ? (
        <p className="p-6 text-center text-secondary">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[15px]">
            {stats.map((s) => (
              <div key={s.category} className="bg-white border border-[#EEEEEE] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: s.color }} />
                <p className="text-label-sm text-secondary pl-3">{s.category}</p>
                <p className="font-tile-number text-[22px] font-bold pl-3 mt-1" style={{ color: s.color }}>{s.percentage}%</p>
                <p className="text-label-sm text-secondary pl-3">KES {s.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <PanelCard title="Category Revenue Breakdown" icon="pie_chart">
            {stats.length === 0 ? (
              <p className="p-6 text-center text-secondary">No completed sales yet.</p>
            ) : (
              <DataTable columns={columns} rows={stats} rowKey={(s) => s.category} />
            )}
          </PanelCard>
        </>
      )}
    </div>
  );
}