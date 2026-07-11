// src/app/(dashboard)/customers/warranty/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";
import Pagination from "@/components/ui/Pagination";
import StatBanner from "@/components/ui/StatBanner";
import { warrantiesApi, ApiError, WarrantyResponseDto } from "@/lib/api";

type DisplayStatus = "Expiring Soon" | "Active" | "Expired";

interface WarrantyRow extends WarrantyResponseDto {
  daysLeft: number;
  displayStatus: DisplayStatus;
}

const STATUS_STYLE: Record<DisplayStatus, { pill: string; daysClass: string; rowClass: string }> = {
  "Expiring Soon": { pill: "bg-error text-on-error", daysClass: "text-error font-bold", rowClass: "" },
  Active: { pill: "bg-secondary-container text-on-secondary-container", daysClass: "text-secondary", rowClass: "" },
  Expired: { pill: "bg-secondary text-white", daysClass: "text-secondary font-bold", rowClass: "opacity-70 bg-surface-container-low" },
};

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function WarrantyTrackerPage() {
  const [warranties, setWarranties] = useState<WarrantyResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    warrantiesApi
      .list()
      .then(setWarranties)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load warranties."))
      .finally(() => setLoading(false));
  }, []);

  const rows: WarrantyRow[] = useMemo(
    () =>
      warranties.map((w) => {
        const daysLeft = daysUntil(w.endDate);
        const displayStatus: DisplayStatus =
          daysLeft < 0 ? "Expired" : daysLeft <= 30 ? "Expiring Soon" : "Active";
        return { ...w, daysLeft, displayStatus };
      }),
    [warranties]
  );

  const expiringSoonCount = rows.filter((r) => r.displayStatus === "Expiring Soon").length;
  const activeCount = rows.filter((r) => r.displayStatus === "Active").length;
  const claimsCount = rows.filter((r) => r.status?.toUpperCase() === "CLAIMED").length;
  const protectionRatio = rows.length ? Math.round((activeCount / rows.length) * 100) : 0;

  const columns: Column<WarrantyRow>[] = [
    { header: "Customer", render: (w) => <span className="font-body-semibold">{w.customerName}</span> },
    { header: "Product", render: (w) => w.productName },
    { header: "Warranty No.", render: (w) => <span className="text-secondary font-mono text-[12px]">{w.warrantyNumber}</span> },
    { header: "Start Date", render: (w) => formatDate(w.startDate) },
    {
      header: "Expiry Date",
      render: (w) =>
        w.displayStatus === "Expiring Soon" ? (
          <span className="font-body-semibold text-error">{formatDate(w.endDate)}</span>
        ) : (
          formatDate(w.endDate)
        ),
    },
    {
      header: "Days Left",
      render: (w) => (
        <span className={STATUS_STYLE[w.displayStatus].daysClass}>
          {w.daysLeft < 0 ? "Expired" : `${w.daysLeft} Days`}
        </span>
      ),
    },
    {
      header: "Status",
      render: (w) => <span className={`status-pill ${STATUS_STYLE[w.displayStatus].pill}`}>{w.displayStatus}</span>,
    },
    {
      header: "Actions",
      align: "right",
      render: (w) => (
        <button className="text-primary hover:underline font-bold text-label-sm">
          {w.displayStatus === "Expired" ? "Renew" : "Manage"}
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">Warranty Tracker</h1>
          <p className="text-label-sm text-secondary">
            Manage customer product warranties and expiration alerts
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-primary text-on-primary px-3 py-1.5 text-label-sm font-bold rounded flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Warranty
          </button>
          <button className="bg-secondary text-on-primary px-3 py-1.5 text-label-sm font-bold rounded flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm">{error}</div>
      )}

      {expiringSoonCount > 0 && (
        <div className="bg-error text-on-error p-3 rounded flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px]">warning</span>
            <div>
              <p className="font-body-semibold">Attention: {expiringSoonCount} Warranties Expiring Soon</p>
              <p className="text-[12px] opacity-90">
                Please review the customers marked in red and initiate follow-up for renewals or
                maintenance checks.
              </p>
            </div>
          </div>
          <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-[12px] font-bold uppercase transition-colors">
            View All
          </button>
        </div>
      )}

      <PanelCard
        title="Customer Warranty List"
        icon="assignment_turned_in"
        headerExtra={
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-label-sm text-secondary">
              <span className="w-3 h-3 rounded-full bg-error"></span> Expiring
            </div>
            <div className="flex items-center gap-2 text-label-sm text-secondary">
              <span className="w-3 h-3 rounded-full bg-secondary"></span> Expired
            </div>
            <div className="flex items-center gap-2 text-label-sm text-secondary">
              <span className="w-3 h-3 rounded-full bg-primary-container"></span> Active
            </div>
          </div>
        }
      >
        {loading ? (
          <p className="p-6 text-center text-secondary">Loading warranties…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-secondary">No warranties recorded yet.</p>
        ) : (
          <>
            <DataTable columns={columns} rows={rows} rowKey={(w) => String(w.id)} />
            <Pagination showingFrom={1} showingTo={rows.length} total={rows.length} currentPage={1} totalPages={1} />
          </>
        )}
      </PanelCard>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBanner value={`${rows.length}`} label="Total Registered" icon="inventory_2" bgColor="bg-primary" footerText="" />
        <StatBanner value={`${expiringSoonCount}`} label="Expiring 30 Days" icon="timer" bgColor="bg-error" footerText="" />
        <StatBanner value={`${claimsCount}`} label="Claims Filed" icon="block" bgColor="bg-secondary" footerText="" />
        <StatBanner value={`${protectionRatio}%`} label="Protection Ratio" icon="verified_user" bgColor="bg-on-secondary-fixed-variant" footerText="" />
      </div>
    </div>
  );
}