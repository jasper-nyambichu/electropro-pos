// src/app/(dashboard)/purchases/suppliers/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import StatBanner from "@/components/ui/StatBanner";
import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";
import Pagination from "@/components/ui/Pagination";
import {
  suppliersApi,
  purchaseOrdersApi,
  ApiError,
  SupplierResponseDto,
  PurchaseOrderResponseDto,
} from "@/lib/api";

interface SupplierRow extends SupplierResponseDto {
  totalPurchased: number;
  lastOrder: string | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierResponseDto[]>([]);
  const [orders, setOrders] = useState<PurchaseOrderResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([suppliersApi.list(), purchaseOrdersApi.list()])
      .then(([s, o]) => {
        setSuppliers(s);
        setOrders(o);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load suppliers."))
      .finally(() => setLoading(false));
  }, []);

  const rows: SupplierRow[] = useMemo(() => {
    return suppliers.map((s) => {
      const supplierOrders = orders.filter((o) => o.supplierName === s.name);
      const totalPurchased = supplierOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const lastOrder = supplierOrders.length
        ? supplierOrders.reduce((latest, o) => (o.orderDate > latest ? o.orderDate : latest), supplierOrders[0].orderDate)
        : null;
      return { ...s, totalPurchased, lastOrder };
    });
  }, [suppliers, orders]);

  const totalSpend = rows.reduce((sum, r) => sum + r.totalPurchased, 0);
  const pendingOrders = orders.filter((o) => o.status?.toUpperCase() !== "RECEIVED").length;
  const topPartner = rows.length
    ? rows.reduce((top, r) => (r.totalPurchased > top.totalPurchased ? r : top), rows[0]).name
    : "—";

  const columns: Column<SupplierRow>[] = [
    { header: "Supplier Name", render: (s) => <span className="font-body-semibold">{s.name}</span> },
    { header: "Contact", render: (s) => s.contactPerson || "—" },
    { header: "Phone", render: (s) => s.phone || "—" },
    {
      // No supplier↔product-category relation exists on the backend yet
      header: "Products Supplied",
      render: () => <span className="text-secondary text-label-sm">Not tracked</span>,
    },
    {
      header: "Total Purchased (KES)",
      align: "right",
      render: (s) => s.totalPurchased.toLocaleString(),
    },
    { header: "Last Order", render: (s) => (s.lastOrder ? formatDate(s.lastOrder) : "—") },
    {
      header: "Actions",
      align: "center",
      render: () => (
        <div className="flex justify-center gap-2">
          <button className="text-blue-600 hover:text-blue-800">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>
          <button className="text-secondary hover:text-primary">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Suppliers</h1>
          <p className="text-label-sm font-label-sm text-secondary">
            Manage your relationship with inventory providers
          </p>
        </div>
        <button className="bg-primary hover:bg-primary-fixed-dim text-on-primary px-4 py-2 flex items-center gap-2 rounded-lg shadow-sm transition-all active:opacity-90">
          <span className="material-symbols-outlined">person_add</span>
          <span className="font-body-semibold text-body-semibold">Add Supplier</span>
        </button>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-[15px]">
        <StatBanner value={String(suppliers.length)} label="Total Suppliers" icon="factory" bgColor="bg-blue-600" footerText="" />
        <StatBanner value={String(pendingOrders)} label="Pending Orders" icon="local_shipping" bgColor="bg-primary-container" footerText="" />
        <StatBanner value={`KES ${totalSpend.toLocaleString()}`} label="Total Spend" icon="payments" bgColor="bg-green-600" footerText="" />
        <StatBanner value={topPartner} label="Top Partner" icon="verified" bgColor="bg-on-secondary-fixed-variant" footerText="" />
      </div>

      <PanelCard
        title="Supplier Directory"
        icon="list_alt"
        headerExtra={
          <div className="flex gap-2">
            <button className="text-label-sm font-label-sm px-2 py-1 border border-outline-variant hover:bg-surface-container transition-colors rounded">
              Export CSV
            </button>
            <button className="text-label-sm font-label-sm px-2 py-1 border border-outline-variant hover:bg-surface-container transition-colors rounded">
              Print
            </button>
          </div>
        }
      >
        {loading ? (
          <p className="p-6 text-center text-secondary">Loading suppliers…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-secondary">No suppliers registered yet.</p>
        ) : (
          <>
            <DataTable columns={columns} rows={rows} rowKey={(s) => String(s.id)} />
            <Pagination
              showingFrom={rows.length ? 1 : 0}
              showingTo={rows.length}
              total={rows.length}
              currentPage={1}
              totalPages={1}
            />
          </>
        )}
      </PanelCard>
    </div>
  );
}