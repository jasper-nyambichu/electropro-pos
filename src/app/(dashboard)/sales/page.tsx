'use client';

import { useEffect, useState } from 'react';
import { saleApi, type SaleResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import TableSkeleton from '@/components/ui/TableSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function SalesPage() {
  const { success, error } = useToast();
  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundTarget, setRefundTarget] = useState<SaleResponse | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    saleApi.getAll()
      .then(setSales)
      .catch((err: unknown) => error('Failed to load sales', err instanceof Error ? err.message : undefined))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? sales.filter(
        (s) =>
          s.receiptNumber?.toLowerCase().includes(search.toLowerCase()) ||
          s.customerName?.toLowerCase().includes(search.toLowerCase()) ||
          s.paymentMethod?.toLowerCase().includes(search.toLowerCase())
      )
    : sales;

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  async function handleRefund() {
    if (!refundTarget) return;
    setRefunding(true);
    try {
      const updated = await saleApi.refund(refundTarget.id);
      setSales((prev) => prev.map((s) => (s.id === refundTarget.id ? updated : s)));
      success('Sale refunded', `Receipt ${refundTarget.receiptNumber} marked as refunded.`);
      setRefundTarget(null);
    } catch (err: unknown) {
      error('Refund failed', err instanceof Error ? err.message : undefined);
    } finally {
      setRefunding(false);
    }
  }

  const fmt = (n: number) =>
    `KES ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

  function statusBadge(status: string) {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-green-100 text-green-800 border border-green-200">Completed</span>;
      case 'REFUNDED':
        return <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-red-100 text-red-700 border border-red-200">Refunded</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-surface-container text-on-surface-variant">{status}</span>;
    }
  }

  const totalRevenue = sales
    .filter((s) => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

  return (
    <div className="p-container_padding">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Sales</h1>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            {sales.length} transactions · Total revenue {fmt(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Sales', value: sales.length, icon: 'receipt_long', color: 'bg-blue-500' },
            { label: 'Completed', value: sales.filter((s) => s.status === 'COMPLETED').length, icon: 'check_circle', color: 'bg-green-500' },
            { label: 'Refunded', value: sales.filter((s) => s.status === 'REFUNDED').length, icon: 'undo', color: 'bg-red-500' },
            { label: 'Revenue', value: fmt(totalRevenue), icon: 'payments', color: 'bg-primary' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} text-white rounded-lg p-4 relative overflow-hidden shadow-sm`}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mt-0.5">{stat.label}</p>
              <span className="material-symbols-outlined absolute right-2 top-3 text-5xl opacity-20">{stat.icon}</span>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm p-4 mb-4">
        <div className="relative max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-[18px]">search</span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by receipt number, customer or payment method…"
            className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">receipt_long</span>
          <span className="font-panel-header text-panel-header">Sales History</span>
        </div>

        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="receipt_long" title="No sales found" description="Sales will appear here after completing a transaction at the POS terminal." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container border-b border-outline-variant/20">
                  <tr>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Receipt #</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Date</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Customer</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Payment</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Amount</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-center">Status</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {paginated.map((s, idx) => (
                    <tr key={s.id}
                      className={`hover:bg-surface-container-low transition-colors ${idx % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-white'}`}>
                      <td className="px-4 py-3 font-body-semibold text-primary">{s.receiptNumber}</td>
                      <td className="px-4 py-3 text-body-reg text-on-surface-variant">
                        {s.saleDate ? new Date(s.saleDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-body-reg text-on-surface">{s.customerName || 'Walk-in'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-secondary">
                            {s.paymentMethod === 'MPESA' ? 'smartphone' : s.paymentMethod === 'CARD' ? 'credit_card' : 'payments'}
                          </span>
                          <span className="text-body-reg text-on-surface-variant">{s.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-body-semibold text-on-surface">
                        {fmt(Number(s.totalAmount || 0))}
                      </td>
                      <td className="px-4 py-3 text-center">{statusBadge(s.status)}</td>
                      <td className="px-4 py-3 text-right">
                        {s.status === 'COMPLETED' && (
                          <button
                            onClick={() => setRefundTarget(s)}
                            className="px-3 py-1 text-xs font-bold border border-error text-error rounded hover:bg-error-container transition-colors"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between">
                <span className="text-label-sm text-on-surface-variant">
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1 border border-outline-variant bg-white rounded text-label-sm hover:bg-surface-container disabled:opacity-40 transition-colors">Previous</button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`px-3 py-1 border rounded text-label-sm transition-colors ${n === page ? 'bg-primary text-on-primary border-primary font-bold' : 'bg-white border-outline-variant hover:bg-surface-container'}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1 border border-outline-variant bg-white rounded text-label-sm hover:bg-surface-container disabled:opacity-40 transition-colors">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        open={!!refundTarget}
        title="Process Refund"
        message={`Are you sure you want to refund receipt ${refundTarget?.receiptNumber}? This action cannot be undone.`}
        confirmLabel="Process Refund"
        onConfirm={handleRefund}
        onCancel={() => setRefundTarget(null)}
        loading={refunding}
      />
    </div>
  );
}