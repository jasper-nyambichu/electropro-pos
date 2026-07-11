// src/app/(dashboard)/sales/quotations/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import PanelCard from "@/components/ui/PanelCard";
import DataTable, { Column } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { quotationsApi, ApiError, QuotationResponseDto } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

type BadgeColor = "amber" | "emerald" | "blue" | "gray";

const STATUS_BADGE: Record<string, BadgeColor> = {
  PENDING: "amber",
  ACCEPTED: "emerald",
  CONVERTED: "blue",
  EXPIRED: "gray",
};

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function QuotationsPage() {
  const toast = useToast();
  const [quotations, setQuotations] = useState<QuotationResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [dateFilter, setDateFilter] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setQuotations(await quotationsApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load quotations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = quotations;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (quo) => String(quo.id).includes(q) || quo.customerName?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All Statuses") {
      list = list.filter((quo) => quo.status?.toUpperCase() === statusFilter.toUpperCase());
    }

    if (dateFilter) {
      list = list.filter((quo) => quo.quotationDate.slice(0, 10) === dateFilter);
    }

    return list;
  }, [quotations, search, statusFilter, dateFilter]);

  async function handleConvert(q: QuotationResponseDto) {
    const status = q.status?.toUpperCase();
    if (status === "CONVERTED" || status === "EXPIRED") return;
    if (!confirm(`Convert quotation #${q.id} to a completed sale?`)) return;
    try {
      await quotationsApi.convert(q.id);
      toast.success(`Quotation #${q.id} converted to a sale.`);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not convert quotation.");
    }
  }

  async function handleDelete(q: QuotationResponseDto) {
    if (q.status?.toUpperCase() === "CONVERTED") return;
    if (!confirm(`Delete quotation #${q.id}?`)) return;
    try {
      await quotationsApi.remove(q.id);
      setQuotations((prev) => prev.filter((x) => x.id !== q.id));
      toast.success(`Quotation #${q.id} deleted.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete quotation.");
    }
  }

  function ActionButtons({ q }: { q: QuotationResponseDto }) {
    const status = q.status?.toUpperCase();
    const isConverted = status === "CONVERTED";
    const isExpired = status === "EXPIRED";

    return (
      <div className="flex justify-end gap-2">
        <button
          disabled={isConverted}
          className={`p-1 rounded transition-colors ${
            isConverted ? "cursor-default opacity-30" : "hover:bg-primary-container/10"
          }`}
          title={isExpired ? "Renew" : "Edit"}
        >
          <span className="material-symbols-outlined text-[18px] text-secondary">
            {isExpired ? "refresh" : "edit"}
          </span>
        </button>
        <button
          onClick={() => handleConvert(q)}
          disabled={isConverted || isExpired}
          className={`p-1 rounded transition-colors ${
            isConverted || isExpired ? "cursor-default opacity-30" : "hover:bg-primary-container/10"
          }`}
          title={isConverted ? `Linked sale #${q.convertedSaleId}` : "Convert to Sale"}
        >
          <span className="material-symbols-outlined text-[18px] text-primary">
            {isConverted ? "link" : "point_of_sale"}
          </span>
        </button>
        <button
          onClick={() => handleDelete(q)}
          disabled={isConverted}
          className={`p-1 rounded transition-colors ${
            isConverted ? "cursor-default opacity-30" : "hover:bg-error-container/10"
          }`}
          title="Delete"
        >
          <span className="material-symbols-outlined text-[18px] text-error">delete</span>
        </button>
      </div>
    );
  }

  const columns: Column<QuotationResponseDto>[] = [
    { header: "Quote ID", width: "120px", render: (q) => <span className="font-body-semibold text-primary">#{q.id}</span> },
    { header: "Date", render: (q) => formatDate(q.quotationDate) },
    { header: "Customer", render: (q) => q.customerName ?? "Walk-in" },
    {
      header: "Description",
      render: (q) => (
        <span className="text-secondary">
          {q.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ") || "—"}
        </span>
      ),
    },
    {
      header: "Total Value",
      align: "right",
      render: (q) => <span className="font-body-semibold">KES {q.totalAmount.toLocaleString()}</span>,
    },
    {
      header: "Status",
      align: "center",
      render: (q) => (
        <Badge color={STATUS_BADGE[q.status?.toUpperCase() ?? ""] ?? "gray"}>
          {statusLabel(q.status ?? "Unknown")}
        </Badge>
      ),
    },
    { header: "Actions", align: "right", render: (q) => <ActionButtons q={q} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">Quotations</h1>
          <p className="text-label-sm text-secondary font-label-sm">
            Manage client quotes and proposals
          </p>
        </div>
        <button className="flex items-center bg-primary hover:opacity-90 text-on-primary px-4 py-2 rounded shadow-sm transition-opacity font-body-semibold">
          <span className="material-symbols-outlined mr-2 text-[20px]">add</span>
          New Quotation
        </button>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm">{error}</div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-secondary uppercase">Search Quotes</label>
            <div className="relative">
              <input
                className="w-full border-surface-variant focus:ring-primary focus:border-primary text-body-reg py-1.5 pl-8 rounded"
                placeholder="ID, Customer..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-2 top-2 text-secondary text-[18px]">search</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-secondary uppercase">Status Filter</label>
            <select
              className="border-surface-variant focus:ring-primary focus:border-primary text-body-reg py-1.5 rounded"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Accepted</option>
              <option>Expired</option>
              <option>Converted</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-secondary uppercase">Date Range</label>
            <input
              className="border-surface-variant focus:ring-primary focus:border-primary text-body-reg py-1.5 rounded"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("All Statuses");
                setDateFilter("");
              }}
              className="bg-secondary text-on-primary px-4 py-1.5 rounded w-full hover:bg-on-secondary-fixed-variant transition-colors font-body-reg"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <PanelCard
        title="Quote Records"
        icon="list_alt"
        headerExtra={
          <div className="flex gap-2">
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
          <p className="p-6 text-center text-secondary">Loading quotations…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-secondary">No quotations found.</p>
        ) : (
          <>
            <DataTable columns={columns} rows={filtered} rowKey={(q) => q.id.toString()} />
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
    </div>
  );
}