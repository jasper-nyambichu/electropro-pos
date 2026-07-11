// src/app/(dashboard)/sales/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StatTile from "@/components/ui/StatTile";
import PanelCard from "@/components/ui/PanelCard";
import DataTable, { Column } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { salesApi, ApiError, SaleResponseDto } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

const PAYMENT_DOT: Record<string, string> = {
  CASH: "bg-gray-500",
  MPESA: "bg-green-500",
  CREDIT: "bg-blue-500",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function last7Days() {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function SalesPage() {
  const toast = useToast();
  const [sales, setSales] = useState<SaleResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateFilter, setDateFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All Methods");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setSales(await salesApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load sales.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const today = todayIso();
  const todaySales = useMemo(
    () => sales.filter((s) => s.saleDate.slice(0, 10) === today && s.status !== "REFUNDED"),
    [sales, today]
  );
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const avgSale = todaySales.length ? todayRevenue / todaySales.length : 0;
  const vatCollected = todayRevenue * 0.16;

  const filtered = useMemo(() => {
    let list = sales;

    if (dateFilter) {
      list = list.filter((s) => s.saleDate.slice(0, 10) === dateFilter);
    }
    if (paymentFilter !== "All Methods") {
      list = list.filter((s) => s.paymentMethod?.toUpperCase() === paymentFilter.toUpperCase());
    }
    if (statusFilter !== "All Status") {
      const wantRefunded = statusFilter === "Voided";
      list = list.filter((s) => (s.status === "REFUNDED") === wantRefunded);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) => s.receiptNumber.toLowerCase().includes(q) || s.customerName?.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }, [sales, dateFilter, paymentFilter, statusFilter, search]);

  const weeklyData = useMemo(() => {
    const days = last7Days();
    const totals = days.map((day) =>
      sales
        .filter((s) => s.saleDate.slice(0, 10) === day && s.status !== "REFUNDED")
        .reduce((sum, s) => sum + s.totalAmount, 0)
    );
    const max = Math.max(...totals, 1);
    return days.map((day, i) => ({
      day: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
      revenue: totals[i],
      height: Math.round((totals[i] / max) * 100) || 4,
    }));
  }, [sales]);

  async function handleRefund(s: SaleResponseDto) {
    if (s.status === "REFUNDED") return;
    if (!confirm(`Refund sale ${s.receiptNumber}?`)) return;
    try {
      await salesApi.refund(s.id);
      toast.success(`Sale ${s.receiptNumber} refunded.`);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not refund sale.");
    }
  }

  const columns: Column<SaleResponseDto>[] = [
    { header: "Sale ID", render: (s) => <span className="font-body-semibold text-primary">{s.receiptNumber}</span> },
    { header: "Date", render: (s) => new Date(s.saleDate).toLocaleString() },
    {
      header: "Items",
      render: (s) => s.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ") || "—",
    },
    {
      header: "Payment Method",
      render: (s) => (
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${PAYMENT_DOT[s.paymentMethod?.toUpperCase()] ?? "bg-gray-400"}`}></span>{" "}
          {s.paymentMethod}
        </span>
      ),
    },
    {
      header: "Total (KES)",
      render: (s) => <span className="font-body-semibold text-primary">{s.totalAmount.toLocaleString()}</span>,
    },
    {
      header: "Status",
      align: "center",
      render: (s) => (
        <Badge color={s.status === "REFUNDED" ? "red" : "green"}>
          {s.status === "REFUNDED" ? "Voided" : "Completed"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (s) => (
        <div className="flex justify-end gap-2">
          <button className="text-secondary hover:text-primary transition-colors" title="View">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>
          <button
            onClick={() => handleRefund(s)}
            disabled={s.status === "REFUNDED"}
            className={`transition-colors ${
              s.status === "REFUNDED" ? "text-secondary opacity-30 cursor-default" : "text-secondary hover:text-error"
            }`}
            title={s.status === "REFUNDED" ? "Already refunded" : "Refund sale"}
          >
            <span className="material-symbols-outlined text-[18px]">
              {s.status === "REFUNDED" ? "undo" : "replay"}
            </span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-gutter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">Sales Overview</h1>
          <p className="text-secondary font-label-sm text-label-sm">
            Manage and track all customer transactions
          </p>
        </div>
        <Link
          href="/pos"
          className="bg-primary text-on-primary px-4 py-2 rounded-sm font-body-semibold hover:bg-primary-container transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          New Sale
        </Link>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <StatTile value={`KES ${Math.round(todayRevenue).toLocaleString()}`} label="Revenue Today" icon="payments" bgColor="bg-[#00c0ef]" />
        <StatTile value={String(todaySales.length)} label="Transactions" icon="shopping_bag" bgColor="bg-[#00a65a]" />
        <StatTile value={`KES ${Math.round(avgSale).toLocaleString()}`} label="Avg Sale Value" icon="trending_up" bgColor="bg-[#f39c12]" />
        <StatTile value={`KES ${Math.round(vatCollected).toLocaleString()}`} label="VAT (16%) Collected" icon="account_balance" bgColor="bg-[#dd4b39]" />
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 p-4 rounded-sm shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="font-label-sm text-secondary">Date:</label>
          <input
            className="border-outline-variant/30 text-body-reg py-1 px-2 focus:border-primary outline-none rounded-sm"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-label-sm text-secondary">Payment:</label>
          <select
            className="border-outline-variant/30 text-body-reg py-1 px-2 focus:border-primary outline-none rounded-sm bg-white"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option>All Methods</option>
            <option>Cash</option>
            <option>Mpesa</option>
            <option>Credit</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-label-sm text-secondary">Status:</label>
          <select
            className="border-outline-variant/30 text-body-reg py-1 px-2 focus:border-primary outline-none rounded-sm bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Completed</option>
            <option>Voided</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2 w-full md:w-auto">
          <input
            className="border-outline-variant/30 text-body-reg py-1 px-2 focus:border-primary outline-none rounded-sm w-full md:w-64"
            placeholder="Search by receipt or customer..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => {
              setDateFilter("");
              setPaymentFilter("All Methods");
              setStatusFilter("All Status");
              setSearch("");
            }}
            className="bg-secondary text-white px-3 py-1.5 rounded-sm hover:bg-on-secondary-fixed-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
          </button>
        </div>
      </div>

      <PanelCard
        title="Recent Sales Transactions"
        icon="list_alt"
        headerExtra={
          <div className="flex items-center gap-2">
            <button className="text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
            <button className="text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">print</span>
            </button>
          </div>
        }
      >
        {loading ? (
          <p className="p-6 text-center text-secondary">Loading sales…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-secondary">No sales found.</p>
        ) : (
          <>
            <DataTable columns={columns} rows={filtered} rowKey={(s) => s.id.toString()} />
            <Pagination
              showingFrom={filtered.length ? 1 : 0}
              showingTo={filtered.length}
              total={filtered.length}
              currentPage={1}
              totalPages={1}
            />
          </>
        )}
      </PanelCard>

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-sm shadow-sm p-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-panel-header text-panel-header">Weekly Sales Trend</h3>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-primary"></span> Revenue
            </span>
          </div>
        </div>
        <div className="h-48 w-full flex items-end justify-between gap-2 px-2 relative">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="border-t border-outline-variant/10 w-full h-px"></div>
            <div className="border-t border-outline-variant/10 w-full h-px"></div>
            <div className="border-t border-outline-variant/10 w-full h-px"></div>
            <div className="border-t border-outline-variant/10 w-full h-px"></div>
          </div>
          {weeklyData.map((d, i) => (
            <div
              key={`${d.day}-${i}`}
              className="flex-1 bg-primary-container/10 relative group hover:bg-primary-container/20 transition-all cursor-pointer"
              style={{ height: `${d.height}%` }}
            >
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-inverse-surface text-white px-1 rounded-sm whitespace-nowrap">
                {d.day}: KES {Math.round(d.revenue).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}