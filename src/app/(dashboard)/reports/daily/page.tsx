'use client';

import { useEffect, useState } from 'react';
import { reportApi, type SaleResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import TableSkeleton from '@/components/ui/TableSkeleton';
import EmptyState from '@/components/ui/EmptyState';

export default function DailyReportPage() {
  const { error } = useToast();
  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi.getDaily()
      .then(setSales)
      .catch((err: unknown) => error('Failed to load report', err instanceof Error ? err.message : undefined))
      .finally(() => setLoading(false));
  }, []);

  const completed = sales.filter((s) => s.status === 'COMPLETED');
  const totalRevenue = completed.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  const totalVat = totalRevenue * 0.16;
  const avgSale = completed.length > 0 ? totalRevenue / completed.length : 0;

  const fmt = (n: number) =>
    `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

  const stats = [
    { label: 'Total Transactions', value: sales.length, icon: 'receipt_long', color: 'bg-green-500' },
    { label: 'Total Revenue', value: fmt(totalRevenue), icon: 'trending_up', color: 'bg-blue-500' },
    { label: 'VAT Collected', value: fmt(totalVat), icon: 'percent', color: 'bg-red-500' },
    { label: 'Average Sale', value: fmt(avgSale), icon: 'analytics', color: 'bg-yellow-500' },
  ];

  return (
    <div className="p-container_padding">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Daily Sales Report</h1>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-body-semibold hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print
          </button>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.color} text-white rounded-lg p-4 relative overflow-hidden shadow-sm`}>
            <p className="text-xl font-bold leading-tight">{loading ? '—' : stat.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mt-1">{stat.label}</p>
            <span className="material-symbols-outlined absolute right-2 top-3 text-5xl opacity-20">{stat.icon}</span>
          </div>
        ))}
      </div>

      {/* Sales table */}
      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">list_alt</span>
          <span className="font-panel-header text-panel-header">Recent Sales</span>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : sales.length === 0 ? (
          <EmptyState icon="receipt_long" title="No sales recorded" description="Sales completed today will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container border-b border-outline-variant/20">
                <tr>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Receipt #</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Customer</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Payment</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Amount</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {sales.map((s, idx) => (
                  <tr key={s.id}
                    className={`hover:bg-surface-container-low transition-colors ${idx % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-white'}`}>
                    <td className="px-4 py-3 font-body-semibold text-primary">{s.receiptNumber}</td>
                    <td className="px-4 py-3 text-body-reg text-on-surface">{s.customerName || 'Walk-in'}</td>
                    <td className="px-4 py-3 text-body-reg text-on-surface-variant">{s.paymentMethod}</td>
                    <td className="px-4 py-3 text-right font-body-semibold text-on-surface">
                      {fmt(Number(s.totalAmount || 0))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded-full border ${
                        s.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}