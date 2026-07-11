// src/app/(dashboard)/purchases/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import StatBanner from "@/components/ui/StatBanner";
import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";
import {
  purchaseOrdersApi,
  suppliersApi,
  ApiError,
  PurchaseOrderResponseDto,
  SupplierResponseDto,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";

const AVATAR_PALETTE = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-red-100", text: "text-red-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-yellow-100", text: "text-yellow-700" },
  { bg: "bg-gray-200", text: "text-gray-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
];

function colorFor(name: string) {
  const hash = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

const STATUS_STYLE: Record<string, { badge: string; border: string }> = {
  RECEIVED: { badge: "bg-green-100 text-green-700", border: "border-green-200" },
  ORDERED: { badge: "bg-orange-100 text-orange-700", border: "border-orange-200" },
  PARTIAL: { badge: "bg-blue-100 text-blue-700", border: "border-blue-200" },
};

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function PurchasesPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<PurchaseOrderResponseDto[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [o, s] = await Promise.all([purchaseOrdersApi.list(), suppliersApi.list()]);
      setOrders(o);
      setSuppliers(s);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load purchase orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalOrders = orders.length;
  const pendingCount = orders.filter((o) => o.status?.toUpperCase() === "ORDERED").length;
  const receivedCount = orders.filter((o) => o.status?.toUpperCase() === "RECEIVED").length;
  const avgOrderValue = orders.length
    ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length
    : 0;

  async function handleReceive(o: PurchaseOrderResponseDto) {
    if (o.status?.toUpperCase() === "RECEIVED") return;
    if (!confirm(`Mark PO #${o.id} as received? This should update stock levels.`)) return;
    try {
      await purchaseOrdersApi.receive(o.id);
      toast.success(`PO #${o.id} marked as received.`);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update purchase order.");
    }
  }

  const monthlySpend = useMemo(() => {
    const months: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const monthKey = d.toISOString().slice(0, 7);
      const total = orders
        .filter((o) => o.orderDate.slice(0, 7) === monthKey)
        .reduce((sum, o) => sum + o.totalAmount, 0);
      months.push({ label, total });
    }
    const max = Math.max(...months.map((m) => m.total), 1);
    return months.map((m) => ({ ...m, pct: Math.round((m.total / max) * 100) || 2 }));
  }, [orders]);

  const columns: Column<PurchaseOrderResponseDto>[] = [
    { header: "PO Number", render: (o) => <span className="font-body-semibold">PO-{String(o.id).padStart(4, "0")}</span> },
    {
      header: "Supplier",
      render: (o) => {
        const c = colorFor(o.supplierName);
        return (
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full ${c.bg} flex items-center justify-center text-[10px] ${c.text} font-bold`}>
              {o.supplierName?.[0]?.toUpperCase() ?? "?"}
            </div>
            {o.supplierName}
          </div>
        );
      },
    },
    {
      header: "Items",
      render: (o) => o.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ") || "—",
    },
    { header: "Total Cost (KES)", render: (o) => <span className="font-mono">{o.totalAmount.toLocaleString()}</span> },
    {
      header: "Status",
      align: "center",
      render: (o) => {
        const key = o.status?.toUpperCase() ?? "";
        const style = STATUS_STYLE[key] ?? { badge: "bg-gray-100 text-gray-700", border: "border-gray-200" };
        return (
          <span className={`${style.badge} text-[11px] font-bold px-2 py-0.5 rounded uppercase border ${style.border}`}>
            {statusLabel(o.status ?? "Unknown")}
          </span>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      render: (o) => (
        <div className="flex justify-end gap-2">
          <button className="text-secondary hover:text-primary transition-colors" title="View">
            <span className="material-symbols-outlined text-[20px]">visibility</span>
          </button>
          <button
            onClick={() => handleReceive(o)}
            disabled={o.status?.toUpperCase() === "RECEIVED"}
            className={`transition-colors ${
              o.status?.toUpperCase() === "RECEIVED"
                ? "text-secondary opacity-30 cursor-default"
                : "text-secondary hover:text-primary"
            }`}
            title={o.status?.toUpperCase() === "RECEIVED" ? "Already received" : "Mark received"}
          >
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Purchase Orders</h1>
          <p className="text-label-sm text-secondary font-label-sm">
            Manage inventory procurement and supplier interactions.
          </p>
        </div>
        <button className="bg-primary text-on-primary flex items-center gap-2 px-4 py-2 rounded shadow-sm hover:opacity-90 transition-opacity font-body-semibold">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New PO
        </button>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-[15px]">
        <StatBanner value={totalOrders.toString()} label="Total Orders" icon="shopping_basket" bgColor="bg-blue-600" footerText="" />
        <StatBanner value={pendingCount.toString()} label="Pending" icon="pending_actions" bgColor="bg-orange-500" footerText="Needs attention" />
        <StatBanner value={receivedCount.toString()} label="Received" icon="verified" bgColor="bg-green-600" footerText="In stock" />
        <StatBanner
          value={`KES ${Math.round(avgOrderValue).toLocaleString()}`}
          label="Avg Order Value"
          icon="query_stats"
          bgColor="bg-red-600"
          footerText=""
        />
      </div>

      <PanelCard
        title="Purchase Order List"
        icon="list_alt"
        headerExtra={
          <div className="flex gap-2">
            <button className="bg-white border border-outline-variant/30 text-secondary text-label-sm px-3 py-1 rounded flex items-center gap-1 hover:bg-surface transition-colors">
              <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
            </button>
            <button className="bg-white border border-outline-variant/30 text-secondary text-label-sm px-3 py-1 rounded flex items-center gap-1 hover:bg-surface transition-colors">
              <span className="material-symbols-outlined text-[16px]">download</span> Export
            </button>
          </div>
        }
      >
        {loading ? (
          <p className="p-6 text-center text-secondary">Loading purchase orders…</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-center text-secondary">No purchase orders yet.</p>
        ) : (
          <>
            <DataTable columns={columns} rows={orders} rowKey={(o) => String(o.id)} />
            <div className="px-[15px] py-[10px] bg-[#F4F4F4] border-t border-[#EEEEEE] flex justify-between items-center">
              <span className="text-label-sm font-label-sm text-secondary">
                Showing {orders.length} of {orders.length} entries
              </span>
            </div>
          </>
        )}
      </PanelCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
        <div className="bg-white p-[15px] border border-[#EEEEEE] rounded md:col-span-2">
          <h3 className="font-panel-header text-panel-header mb-3 uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Recent Expenditure Trend
          </h3>
          <div className="h-48 w-full flex items-end justify-between gap-3 px-2">
            {monthlySpend.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                  KES {Math.round(m.total).toLocaleString()}
                </span>
                <div
                  className="w-full bg-primary/70 hover:bg-primary transition-colors rounded-t"
                  style={{ height: `${m.pct}%`, minHeight: "4px" }}
                />
                <span className="text-[10px] text-secondary/60">{m.label.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-[15px] border border-[#EEEEEE] rounded">
          <h3 className="font-panel-header text-panel-header mb-3 uppercase flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary">quick_reference_all</span>
            Quick Supplier Contact
          </h3>
          <div className="space-y-3">
            {suppliers.slice(0, 3).map((s) => (
              <div key={s.id} className="flex items-center justify-between group cursor-pointer hover:bg-surface transition-colors p-1 rounded">
                <div className="flex items-center gap-2">
                  <Avatar initials={s.name?.[0]?.toUpperCase() ?? "?"} bgColor={colorFor(s.name).bg} textColor={colorFor(s.name).text} />
                  <div>
                    <p className="text-body-semibold text-on-surface">{s.name}</p>
                    <p className="text-[11px] text-secondary">{s.email || s.phone || "—"}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                  call
                </span>
              </div>
            ))}
            {suppliers.length === 0 && !loading && (
              <p className="text-label-sm text-secondary">No suppliers registered yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}