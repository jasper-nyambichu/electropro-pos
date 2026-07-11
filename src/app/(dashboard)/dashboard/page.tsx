// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SalesChart from "@/components/charts/SalesChart";
import {
  categoriesApi,
  customersApi,
  productsApi,
  quotationsApi,
  salesApi,
  ApiError,
  CategoryResponseDto,
  CustomerResponseDto,
  ProductResponseDto,
  QuotationResponseDto,
  SaleResponseDto,
} from "@/lib/api";

interface TopProduct {
  name: string;
  revenue: number;
  pct: number;
}

interface Tile {
  value: string | number;
  label: string;
  icon: string;
  bg: string;
  href: string;
}

export default function DashboardPage() {
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [customers, setCustomers] = useState<CustomerResponseDto[]>([]);
  const [sales, setSales] = useState<SaleResponseDto[]>([]);
  const [quotations, setQuotations] = useState<QuotationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      productsApi.list(),
      categoriesApi.list(),
      customersApi.list(),
      salesApi.list(),
      quotationsApi.list(),
    ])
      .then(([p, c, cu, s, q]) => {
        setProducts(p);
        setCategories(c);
        setCustomers(cu);
        setSales(s);
        setQuotations(q);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard data.")
      )
      .finally(() => setLoading(false));
  }, []);

  const completedSales = useMemo(
    () => sales.filter((s) => s.status !== "REFUNDED"),
    [sales]
  );

  // "Open" = quotations not yet converted into a sale
  const openInvoices = useMemo(
    () => quotations.filter((q) => !q.convertedSaleId).length,
    [quotations]
  );

  const topProducts: TopProduct[] = useMemo(() => {
    const totals = new Map<string, number>();
    for (const sale of completedSales) {
      for (const item of sale.items) {
        totals.set(item.productName, (totals.get(item.productName) ?? 0) + item.subtotal);
      }
    }
    const sorted = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([name, revenue]) => ({
      name,
      revenue,
      pct: Math.round((revenue / max) * 100),
    }));
  }, [completedSales]);

  const monthLabel = useMemo(
    () => new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    []
  );

  const tiles: Tile[] = [
    // No terminals/staff/backup/branch endpoints exist yet — kept static.
    { value: "3", label: "POS Terminals", icon: "monitor", bg: "#E74C3C", href: "/pos" },
    { value: products.length, label: "Products", icon: "barcode_scanner", bg: "#E67E22", href: "/products" },
    { value: completedSales.length, label: "Total Sales", icon: "shopping_cart", bg: "#F1C40F", href: "/sales" },
    { value: openInvoices, label: "Open Invoices", icon: "notifications_active", bg: "#27AE60", href: "/sales" },
    { value: categories.length, label: "Categories", icon: "sell", bg: "#2980B9", href: "/categories" },
    { value: quotations.length, label: "Quotations", icon: "description", bg: "#8E44AD", href: "/sales/quotations" },
    { value: customers.length, label: "Customers", icon: "group", bg: "#E67E22", href: "/customers" },
    { value: "·", label: "Settings", icon: "settings", bg: "#E74C3C", href: "/settings" },
    { value: "·", label: "Reports", icon: "analytics", bg: "#95A5A6", href: "/reports/daily" },
    { value: "4", label: "Staff Users", icon: "person", bg: "#3498DB", href: "/settings" },
    { value: "·", label: "Data Backup", icon: "database", bg: "#2C3E50", href: "/settings" },
    { value: "1", label: "Branch", icon: "storefront", bg: "#27AE60", href: "/settings" },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">Dashboard</h1>
          <nav className="flex text-label-sm font-label-sm text-on-surface-variant gap-2 mt-1 items-center">
            <span className="material-symbols-outlined text-[14px] text-primary">home</span>
            <span>Home</span>
            <span>/</span>
            <span>Dashboard</span>
          </nav>
        </div>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm mb-6">
          {error}
        </div>
      )}

      {/* Quick Links Panel */}
      <div className="bg-white border border-surface-container shadow-sm mb-6">
        <div className="px-gutter py-2 border-b border-surface-container font-panel-header text-panel-header flex items-center">
          <span className="material-symbols-outlined mr-2 text-[18px]">link</span>
          Quick Links
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="relative h-[120px] text-white p-4 rounded-sm overflow-hidden shadow-sm hover:brightness-95 transition-all cursor-pointer dashboard-tile block"
              style={{ backgroundColor: tile.bg }}
            >
              <div className="font-tile-number text-tile-number leading-none">
                {loading ? "…" : tile.value}
              </div>
              <div className="font-body-reg text-body-reg mt-1">{tile.label}</div>
              <span className="material-symbols-outlined absolute right-2 top-2 text-[60px] opacity-20 pointer-events-none">
                {tile.icon}
              </span>
              <div className="absolute bottom-0 left-0 w-full h-6 bg-black/10 flex items-center justify-center font-label-sm text-[10px] text-white/80">
                More Info{" "}
                <span className="material-symbols-outlined text-[12px] ml-1">arrow_circle_right</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-20">
        {/* Sales Chart */}
        <div className="lg:col-span-6 bg-white border border-surface-container shadow-sm">
          <div className="px-gutter py-2 border-b border-surface-container font-panel-header text-panel-header flex items-center justify-between">
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-2 text-[18px]">show_chart</span>
              Sales Graph (KES thousands)
            </div>
            <div className="flex gap-4 text-[10px] font-label-sm uppercase">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#2980B9] inline-block"></span> VAT
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#2C3E50] inline-block"></span> Discounts
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#27AE60] inline-block"></span> Revenue
              </span>
            </div>
          </div>
          <div className="p-5" style={{ height: "330px" }}>
            <SalesChart />
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-4 bg-white border border-surface-container shadow-sm">
          <div className="px-gutter py-2 border-b border-surface-container font-panel-header text-panel-header flex items-center">
            <span className="material-symbols-outlined mr-2 text-[18px]">inventory</span>
            Top Products ({monthLabel})
          </div>
          <div className="p-5 flex flex-col gap-6">
            {loading ? (
              <p className="text-center text-secondary text-label-sm">Loading…</p>
            ) : topProducts.length === 0 ? (
              <p className="text-center text-secondary text-label-sm">No completed sales yet.</p>
            ) : (
              topProducts.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between font-body-semibold text-body-semibold mb-1">
                    <span>{p.name}</span>
                    <span className="text-primary">KES {Math.round(p.revenue).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full">
                    <div
                      className="bg-[#27AE60] h-full rounded-full"
                      style={{ width: `${p.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}