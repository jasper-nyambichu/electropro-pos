// src/app/(dashboard)/products/low-stock/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";
import Pagination from "@/components/ui/Pagination";
import {
  productsApi,
  purchaseOrdersApi,
  ApiError,
  ProductResponseDto,
} from "@/lib/api";

type Status = "Critical" | "Low Stock" | "Out of Stock";

interface StockRow extends ProductResponseDto {
  status: Status;
}

const STATUS_STYLES: Record<Status, { badge: string; stock: string }> = {
  Critical: {
    badge: "bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
    stock: "text-[#E8401C] font-bold",
  },
  "Low Stock": {
    badge: "bg-[#FFF4E5] text-[#663C00] border border-[#FFD599] px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
    stock: "text-[#B72300] font-bold",
  },
  "Out of Stock": {
    badge: "bg-black text-white px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
    stock: "text-[#ba1a1a] font-bold",
  },
};

function classify(quantity: number, threshold: number): Status {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= threshold / 2) return "Critical";
  return "Low Stock";
}

export default function LowStockPage() {
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([productsApi.lowStock(), purchaseOrdersApi.list()])
      .then(([lowStock, orders]) => {
        setProducts(lowStock);
        setPendingOrders(orders.filter((o) => o.status?.toUpperCase() !== "RECEIVED").length);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load low stock items."))
      .finally(() => setLoading(false));
  }, []);

  const rows: StockRow[] = useMemo(
    () => products.map((p) => ({ ...p, status: classify(p.quantity, p.lowStockThreshold) })),
    [products]
  );

  const restockValueNeeded = useMemo(
    () =>
      rows.reduce((sum, p) => {
        const deficit = Math.max(p.lowStockThreshold - p.quantity, 0);
        return sum + deficit * p.price;
      }, 0),
    [rows]
  );

  const columns: Column<StockRow>[] = [
    {
      header: "Product",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-container flex items-center justify-center rounded overflow-hidden border border-outline-variant/10 flex-shrink-0">
            <span className="material-symbols-outlined text-secondary text-[20px]">inventory_2</span>
          </div>
          <span className="font-body-semibold">{item.name}</span>
        </div>
      ),
    },
    { header: "SKU", render: (item) => <span className="font-mono text-[12px] text-secondary">{item.sku}</span> },
    { header: "Category", render: (item) => <span className="text-secondary">{item.categoryName ?? "Uncategorized"}</span> },
    {
      header: "Stock",
      align: "center",
      render: (item) => <span className={STATUS_STYLES[item.status].stock}>{item.quantity}</span>,
    },
    { header: "Threshold", align: "center", render: (item) => <span className="text-secondary">{item.lowStockThreshold}</span> },
    {
      header: "Status",
      render: (item) => <span className={STATUS_STYLES[item.status].badge}>{item.status}</span>,
    },
    {
      header: "Actions",
      align: "right",
      render: (item) => (
        <button
          className={`text-xs font-bold py-1.5 px-3 rounded hover:opacity-90 transition-opacity text-white ${
            item.status === "Out of Stock" ? "bg-primary" : "bg-secondary"
          }`}
        >
          {item.status === "Out of Stock" ? "Reorder Now" : "Reorder"}
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Alert banner */}
      <div className="amber-alert p-4 rounded flex items-center shadow-sm">
        <span className="material-symbols-outlined mr-3 text-[24px]">warning</span>
        <div className="flex-1">
          <h3 className="font-bold text-sm">Critical Inventory Alert</h3>
          <p className="text-[13px]">
            {loading
              ? "Checking inventory levels…"
              : `There ${rows.length === 1 ? "is" : "are"} ${rows.length} item${
                  rows.length === 1 ? "" : "s"
                } currently below their reorder threshold. Immediate action recommended to avoid stockouts.`}
          </p>
        </div>
        <button className="bg-white/50 hover:bg-white text-xs px-3 py-1.5 rounded font-bold uppercase tracking-wide border border-black/10 transition-colors">
          Generate PO All
        </button>
      </div>

      {/* Page header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Low Stock Alerts</h1>
          <p className="text-secondary font-body-reg">Detailed view of products requiring replenishment</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-outline-variant/30 px-4 py-2 text-secondary font-body-semibold flex items-center shadow-sm hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px] mr-2">download</span> Export CSV
          </button>
          <button className="bg-primary text-on-primary px-4 py-2 font-body-semibold flex items-center shadow-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px] mr-2">add_shopping_cart</span> Bulk Reorder
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm">{error}</div>
      )}

      {/* Table */}
      <PanelCard title="Active Alerts Table" icon="inventory">
        {loading ? (
          <p className="p-6 text-center text-secondary">Loading low stock items…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-secondary">Nothing below threshold — inventory looks healthy.</p>
        ) : (
          <>
            <DataTable columns={columns} rows={rows} rowKey={(i) => String(i.id)} />
            <Pagination showingFrom={1} showingTo={rows.length} total={rows.length} currentPage={1} totalPages={1} />
          </>
        )}
      </PanelCard>

      {/* Bento summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
        <div className="bg-white border border-[#EEEEEE] p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error flex-shrink-0">
            <span className="material-symbols-outlined text-[28px]">trending_down</span>
          </div>
          <div>
            <p className="text-secondary text-xs uppercase font-bold tracking-tight">Restock Value Needed</p>
            <p className="text-2xl font-bold">KES {Math.round(restockValueNeeded).toLocaleString()}</p>
            <p className="text-[11px] text-error font-bold">Value to bring all items to threshold</p>
          </div>
        </div>
        <div className="bg-white border border-[#EEEEEE] p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary flex-shrink-0">
            <span className="material-symbols-outlined text-[28px]">local_shipping</span>
          </div>
          <div>
            <p className="text-secondary text-xs uppercase font-bold tracking-tight">Pending Orders</p>
            <p className="text-2xl font-bold">{pendingOrders}</p>
            <p className="text-[11px] text-on-secondary-container font-bold">Incoming stock shipments</p>
          </div>
        </div>
      </div>
    </div>
  );
}