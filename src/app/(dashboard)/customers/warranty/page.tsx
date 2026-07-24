'use client';

import { useEffect, useState } from 'react';
import { warrantyApi, type WarrantyResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { isManagerOrAbove } from '@/lib/auth';
import TableSkeleton from '@/components/ui/TableSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function WarrantyPage() {
  const { success, error } = useToast();
  const [warranties, setWarranties] = useState<WarrantyResponse[]>([]);
  const [expiring, setExpiring] = useState<WarrantyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimTarget, setClaimTarget] = useState<WarrantyResponse | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'expiring'>('all');
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    setCanClaim(isManagerOrAbove());
    Promise.all([warrantyApi.getAll(), warrantyApi.getExpiring()])
      .then(([all, exp]) => { setWarranties(all); setExpiring(exp); })
      .catch((err: unknown) => error('Failed to load warranties', err instanceof Error ? err.message : undefined))
      .finally(() => setLoading(false));
  }, []);

  async function handleClaim() {
    if (!claimTarget) return;
    setClaiming(true);
    try {
      const updated = await warrantyApi.claim(claimTarget.id);
      setWarranties((prev) => prev.map((w) => (w.id === claimTarget.id ? updated : w)));
      success('Warranty claimed', `Warranty ${claimTarget.warrantyNumber} has been marked as claimed.`);
      setClaimTarget(null);
    } catch (err: unknown) {
      error('Claim failed', err instanceof Error ? err.message : undefined);
    } finally {
      setClaiming(false);
    }
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      ACTIVE: 'bg-blue-100 text-blue-800 border-blue-200',
      CLAIMED: 'bg-green-100 text-green-800 border-green-200',
      EXPIRED: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return (
      <span className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded-full border ${map[status] ?? 'bg-surface-container text-on-surface-variant'}`}>
        {status}
      </span>
    );
  }

  const displayed = activeTab === 'expiring' ? expiring : warranties;

  return (
    <div className="p-container_padding">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Warranty Tracker</h1>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            {warranties.length} total · {expiring.length} expiring within 30 days
          </p>
        </div>
      </div>

      {expiring.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-yellow-600 shrink-0">schedule</span>
          <div>
            <p className="font-semibold text-yellow-800 text-sm">Warranties Expiring Soon</p>
            <p className="text-yellow-700 text-xs mt-0.5">
              {expiring.length} warrant{expiring.length !== 1 ? 'ies' : 'y'} will expire within the next 30 days. Contact customers proactively.
            </p>
          </div>
          <button onClick={() => setActiveTab('expiring')}
            className="ml-auto px-3 py-1 bg-yellow-600 text-white rounded text-xs font-bold hover:bg-yellow-700 transition-colors whitespace-nowrap">
            View {expiring.length}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-outline-variant/20">
        {(['all', 'expiring'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}>
            {tab === 'all' ? `All Warranties (${warranties.length})` : `Expiring Soon (${expiring.length})`}
          </button>
        ))}
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
          <span className="font-panel-header text-panel-header">
            {activeTab === 'expiring' ? 'Expiring Warranties' : 'All Warranties'}
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : displayed.length === 0 ? (
          <EmptyState
            icon="verified_user"
            title={activeTab === 'expiring' ? 'No warranties expiring soon' : 'No warranties yet'}
            description={activeTab === 'expiring' ? 'All active warranties are valid for more than 30 days.' : 'Warranties will appear here when registered.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container border-b border-outline-variant/20">
                <tr>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Warranty #</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Customer</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Product</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Start Date</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Expiry Date</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-center">Status</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {displayed.map((w, idx) => (
                  <tr key={w.id}
                    className={`hover:bg-surface-container-low transition-colors ${idx % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-white'}`}>
                    <td className="px-4 py-3 font-body-semibold text-primary text-sm">{w.warrantyNumber}</td>
                    <td className="px-4 py-3 text-body-reg text-on-surface">{w.customerName}</td>
                    <td className="px-4 py-3 text-body-reg text-on-surface-variant">{w.productName}</td>
                    <td className="px-4 py-3 text-body-reg text-on-surface-variant">
                      {w.startDate ? new Date(w.startDate).toLocaleDateString('en-KE') : '—'}
                    </td>
                    <td className="px-4 py-3 text-body-reg text-on-surface-variant">
                      {w.endDate ? new Date(w.endDate).toLocaleDateString('en-KE') : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">{statusBadge(w.status)}</td>
                    <td className="px-4 py-3 text-right">
                      {w.status === 'ACTIVE' && canClaim && (
                        <button onClick={() => setClaimTarget(w)}
                          className="px-3 py-1 bg-primary text-on-primary rounded text-xs font-bold hover:brightness-110 transition-all">
                          Claim
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canClaim && (
        <ConfirmModal
          open={!!claimTarget}
          title="Process Warranty Claim"
          message={`Mark warranty ${claimTarget?.warrantyNumber} for ${claimTarget?.customerName} as claimed? This will update the warranty status to CLAIMED.`}
          confirmLabel="Process Claim"
          onConfirm={handleClaim}
          onCancel={() => setClaimTarget(null)}
          loading={claiming}
        />
      )}
    </div>
  );
}