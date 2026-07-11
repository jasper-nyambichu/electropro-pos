"use client";

import { useEffect, useMemo, useState } from "react";
import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";
import { salesApi, ApiError, SaleResponseDto } from "@/lib/api";

const PAYMENT_DOT: Record<string, string> = {
  CASH: "bg-[#28a745]",
  MPESA: "bg-[#17a2b8]",
  CREDIT: "bg-[#ffc107]",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyReportPage() {
  const [sales, setSales] = useState<SaleResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(todayIso());

  useEffect(() => {
    setLoading(true);
    setError(null);
    salesApi
      .list()
      .then(setSales)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load sales."))
      .finally(() => setLoading(false));
  }, []);

  const daySales = useMemo(
    () => sales.filter((s) => s.saleDate.slice(0, 10) === date && s.status !== "REFUNDED"),
    [sales, date]
  );

  const totalRevenue = daySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const avgTransaction = daySales.length ? totalRevenue / daySales.length : 0;
  const vatCollected = totalRevenue * 0.16;

  const paymentBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const s of daySales) {
      totals[s.paymentMethod] = (totals[s.paymentMethod] ?? 0) + s.totalAmount;
    }
    const grand = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(totals).map(([method, amount]) => ({
      method,
      pct: Math.round((amount / grand) * 100),
    }));
  }, [daySales]);

  const columns: Column<SaleResponseDto>[] = [
    { header: "Receipt", render: (s) => <span className="font-body-semibold text-primary">{s.receiptNumber}</span> },
    { header: "Time", render: (s) => new Date(s.saleDate).toLocaleTimeString() },
    { header: "Customer", render: (s) => s.customerName ?? "Walk-in" },
    { header: "Items", render: (s) => s.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ") || "—" },
    { header: "Total Amount", render: (s) => <span className="font-body-semibold">KES {s.totalAmount.toLocaleString()}</span> },
    {
      header: "Payment",
      render: (s) => (
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${PAYMENT_DOT[s.paymentMethod] ?? "bg-gray-400"}`}></span> {s.paymentMethod}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-[15px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-page-title font-page-title text-on-background">Daily Sales Report</h1>
          <p className="text-secondary text-label-sm">Review operational performance for the selected day</p>
        </div>
        <div className="flex items-center bg-white border border-outline-variant/30 rounded px-2 py-1 shadow-sm">
          <span className="material-symbols-outlined text-[18px] text-secondary mr-2">calendar_today</span>
          <input
            className="border-none focus:ring-0 p-0 text-body-reg text-on-background bg-transparent"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[15px]">
        <div className="bg-[#17a2b8] text-white rounded overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative">
          <div className="p-4">
            <div className="text-tile-number font-tile-number">KES {Math.round(totalRevenue).toLocaleString()}</div>
            <div className="text-label-sm font-body-semibold opacity-90">Total Revenue</div>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-4 text-[64px] opacity-20 pointer-events-none">payments</span>
        </div>
        <div className="bg-[#28a745] text-white rounded overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative">
          <div className="p-4">
            <div className="text-tile-number font-tile-number">{daySales.length}</div>
            <div className="text-label-sm font-body-semibold opacity-90">Transactions</div>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-4 text-[64px] opacity-20 pointer-events-none">shopping_basket</span>
        </div>
        <div className="bg-[#ffc107] text-[#212529] rounded overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative">
          <div className="p-4">
            <div className="text-tile-number font-tile-number">KES {Math.round(avgTransaction).toLocaleString()}</div>
            <div className="text-label-sm font-body-semibold opacity-80">Avg. Transaction Value</div>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-4 text-[64px] opacity-20 pointer-events-none">analytics</span>
        </div>
        <div className="bg-[#dc3545] text-white rounded overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative">
          <div className="p-4">
            <div className="text-tile-number font-tile-number">KES {Math.round(vatCollected).toLocaleString()}</div>
            <div className="text-label-sm font-body-semibold opacity-90">Total VAT (16%)</div>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-4 text-[64px] opacity-20 pointer-events-none">receipt</span>
        </div>
      </div>

      <PanelCard title="Sales by Payment Method" icon="pie_chart">
        <div className="p-6">
          {paymentBreakdown.length === 0 ? (
            <p className="text-center text-secondary">No sales recorded for this date.</p>
          ) : (
            <div className="space-y-3 max-w-md mx-auto">
              {paymentBreakdown.map((p) => (
                <div key={p.method} className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${PAYMENT_DOT[p.method] ?? "bg-gray-400"}`}></span>
                  <span className="text-label-sm font-body-semibold w-16">{p.method}</span>
                  <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${p.pct}%` }} />
                  </div>
                  <span className="text-label-sm w-10 text-right">{p.pct}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </PanelCard>

      <PanelCard title="Itemized Sales" icon="list_alt" headerExtra={<span className="text-label-sm text-secondary">{daySales.length} transactions</span>}>
        {loading ? (
          <p className="p-6 text-center text-secondary">Loading…</p>
        ) : daySales.length === 0 ? (
          <p className="p-6 text-center text-secondary">No sales recorded for this date.</p>
        ) : (
          <DataTable columns={columns} rows={daySales} rowKey={(s) => String(s.id)} />
        )}
      </PanelCard>
    </div>
  );
}