// src/app/(dashboard)/customers/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";
import Pagination from "@/components/ui/Pagination";
import {
  customersApi,
  salesApi,
  ApiError,
  CustomerResponseDto,
  SaleResponseDto,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";

const AVATAR_COLORS = [
  "bg-primary-fixed",
  "bg-secondary-fixed",
  "bg-tertiary-fixed",
  "bg-primary-fixed-dim",
  "bg-secondary-fixed-dim",
  "bg-tertiary-fixed-dim",
  "bg-outline-variant",
];

type SortOption = "newest" | "spent-desc" | "spent-asc" | "alpha";

interface CustomerRow extends CustomerResponseDto {
  fullName: string;
  initials: string;
  avatarBg: string;
  purchases: number;
  totalSpent: number;
}

function initialsOf(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";
}

function cityFromAddress(address?: string) {
  if (!address) return null;
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
}

export default function CustomersPage() {
  const toast = useToast();
  const [customers, setCustomers] = useState<CustomerResponseDto[]>([]);
  const [sales, setSales] = useState<SaleResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [c, s] = await Promise.all([customersApi.list(), salesApi.list()]);
      setCustomers(c);
      setSales(s.filter((sale) => sale.status !== "REFUNDED"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const rows: CustomerRow[] = useMemo(() => {
    return customers.map((c, i) => {
      const fullName = `${c.firstname} ${c.lastname}`.trim();
      const customerSales = sales.filter((s) => s.customerName === fullName);
      return {
        ...c,
        fullName,
        initials: initialsOf(c.firstname, c.lastname),
        avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length],
        purchases: customerSales.length,
        totalSpent: customerSales.reduce((sum, s) => sum + s.totalAmount, 0),
      };
    });
  }, [customers, sales]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    for (const c of customers) {
      const city = cityFromAddress(c.address);
      if (city) set.add(city);
    }
    return Array.from(set).sort();
  }, [customers]);

  const filtered = useMemo(() => {
    let list = rows;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q)
      );
    }

    if (locationFilter !== "All Locations") {
      list = list.filter((c) => cityFromAddress(c.address) === locationFilter);
    }

    const sorted = [...list];
    switch (sortBy) {
      case "spent-desc":
        sorted.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      case "spent-asc":
        sorted.sort((a, b) => a.totalSpent - b.totalSpent);
        break;
      case "alpha":
        sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
        break;
      case "newest":
      default:
        sorted.sort((a, b) => b.id - a.id); // no createdAt on the DTO — id desc as a proxy
    }
    return sorted;
  }, [rows, search, locationFilter, sortBy]);

  async function handleDelete(c: CustomerRow) {
    if (!confirm(`Delete customer "${c.fullName}"?`)) return;
    try {
      await customersApi.remove(c.id);
      setCustomers((prev) => prev.filter((x) => x.id !== c.id));
      toast.success(`Customer "${c.fullName}" deleted.`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete customer.");
    }
  }

  const columns: Column<CustomerRow>[] = [
    {
      header: "Customer Name",
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar initials={c.initials} bgColor={c.avatarBg} />
          <div>
            <div className="font-body-semibold">{c.fullName}</div>
            <div className="text-[11px] text-secondary">{c.phone || c.email || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact Info",
      render: (c) => (
        <div>
          <div className="text-on-surface">{c.phone || "—"}</div>
          <div className="text-label-sm text-secondary">{c.email || "—"}</div>
        </div>
      ),
    },
    { header: "Location", render: (c) => cityFromAddress(c.address) ?? "—" },
    { header: "Purchases", align: "center", render: (c) => c.purchases },
    {
      header: "Total Spent (KES)",
      align: "right",
      render: (c) => (
        <span className="font-body-semibold text-primary">
          {c.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "center",
      render: (c) => (
        <div className="flex justify-center gap-1">
          <button
            title="Editing isn't wired up yet"
            className="p-1.5 hover:bg-secondary-container rounded text-secondary transition-colors opacity-50 cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button
            onClick={() => handleDelete(c)}
            className="p-1.5 hover:bg-error-container rounded text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-gutter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">Customer Directory</h1>
          <p className="text-label-sm text-secondary">
            Manage and track your customer base and their purchasing behavior.
          </p>
        </div>
        <Link
          href="/customers/add"
          className="bg-primary hover:bg-primary-container text-on-primary font-body-semibold px-4 py-2 rounded flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Add Customer
        </Link>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm">{error}</div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded p-4 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
              filter_list
            </span>
            <input
              className="w-full pl-10 pr-3 py-2 border border-outline-variant/50 rounded focus:ring-1 focus:ring-primary focus:border-primary text-body-reg bg-surface"
              placeholder="Filter by name or email..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            className="border border-outline-variant/50 rounded py-2 px-3 text-body-reg bg-surface focus:ring-1 focus:ring-primary"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option>All Locations</option>
            {locations.map((loc) => (
              <option key={loc}>{loc}</option>
            ))}
          </select>
          <select
            className="border border-outline-variant/50 rounded py-2 px-3 text-body-reg bg-surface focus:ring-1 focus:ring-primary"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="newest">Sort by: Newest</option>
            <option value="spent-desc">Total Spent (High to Low)</option>
            <option value="spent-asc">Total Spent (Low to High)</option>
            <option value="alpha">Alphabetical</option>
          </select>
          <button className="p-2 border border-outline-variant/50 rounded hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-secondary">download</span>
          </button>
        </div>
      </div>

      <PanelCard
        title="Active Customers"
        icon="list_alt"
        headerExtra={
          <span className="text-label-sm text-secondary">
            Displaying {filtered.length} of {customers.length} entries
          </span>
        }
      >
        {loading ? (
          <p className="p-6 text-center text-secondary">Loading customers…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-secondary">No customers found.</p>
        ) : (
          <>
            <DataTable columns={columns} rows={filtered} rowKey={(c) => String(c.id)} />
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