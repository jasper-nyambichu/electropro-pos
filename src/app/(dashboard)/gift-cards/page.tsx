'use client';

import { useEffect, useState } from 'react';
import { giftCardApi, type GiftCardResponse, type GiftCardRequest } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import TableSkeleton from '@/components/ui/TableSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function GiftCardsPage() {
  const { success, error } = useToast();
  const [cards, setCards] = useState<GiftCardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GiftCardRequest>({ initialValue: 0, expiryDate: '' });
  const [saving, setSaving] = useState(false);
  const [redeemTarget, setRedeemTarget] = useState<GiftCardResponse | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    giftCardApi.getAll()
      .then(setCards)
      .catch((err: unknown) => error('Failed to load gift cards', err instanceof Error ? err.message : undefined))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.expiryDate) { error('Validation', 'Please set an expiry date.'); return; }
    setSaving(true);
    try {
      const created = await giftCardApi.create(form);
      setCards((prev) => [...prev, created]);
      success('Gift card created', `Code: ${created.code}`);
      setShowForm(false);
      setForm({ initialValue: 0, expiryDate: '' });
    } catch (err: unknown) {
      error('Create failed', err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  }

  async function handleRedeem() {
    if (!redeemTarget) return;
    setRedeeming(true);
    try {
      const updated = await giftCardApi.redeem(redeemTarget.code);
      setCards((prev) => prev.map((c) => (c.id === redeemTarget.id ? updated : c)));
      success('Gift card redeemed', `${redeemTarget.code} has been fully redeemed.`);
      setRedeemTarget(null);
    } catch (err: unknown) {
      error('Redeem failed', err instanceof Error ? err.message : undefined);
    } finally {
      setRedeeming(false);
    }
  }

  const filtered = search
    ? cards.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()))
    : cards;

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      REDEEMED: 'bg-gray-100 text-gray-600 border-gray-200',
      EXPIRED: 'bg-red-100 text-red-700 border-red-200',
    };
    return (
      <span className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded-full border ${map[status] ?? 'bg-surface-container text-on-surface-variant'}`}>
        {status}
      </span>
    );
  }

  const fmt = (n: number) =>
    `KES ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

  return (
    <div className="p-container_padding">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Gift Cards</h1>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            {cards.filter((c) => c.status === 'ACTIVE').length} active · {cards.length} total
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body-semibold flex items-center gap-2 hover:brightness-110 transition-all shadow-sm self-start">
          <span className="material-symbols-outlined text-[18px]">add_card</span>
          Issue Gift Card
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm p-5 mb-6">
          <h2 className="font-panel-header text-panel-header mb-4">Issue New Gift Card</h2>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Initial Value (KES) *</label>
              <input required type="number" min="1" value={form.initialValue || ''}
                onChange={(e) => setForm({ ...form, initialValue: Number(e.target.value) })}
                placeholder="5000.00"
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">Expiry Date *</label>
              <input required type="date" value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all" />
            </div>
            <div className="flex gap-2 items-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-body-semibold hover:bg-surface-container transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 bg-primary text-on-primary rounded-lg font-body-semibold hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-60">
                {saving && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
                Issue Card
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm p-4 mb-4">
        <div className="relative max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-[18px]">search</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by gift card code…"
            className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-body-reg focus:ring-2 focus:ring-primary outline-none transition-all" />
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">card_giftcard</span>
          <span className="font-panel-header text-panel-header">Gift Cards</span>
        </div>

        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="card_giftcard" title="No gift cards yet"
            description="Issue your first gift card to start tracking balances."
            actionLabel="Issue Gift Card" onAction={() => setShowForm(true)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container border-b border-outline-variant/20">
                <tr>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Code</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Initial Value</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Balance</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Expiry</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-center">Status</th>
                  <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filtered.map((c, idx) => (
                  <tr key={c.id}
                    className={`hover:bg-surface-container-low transition-colors ${idx % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-white'}`}>
                    <td className="px-4 py-3 font-mono font-bold text-primary tracking-wider">{c.code}</td>
                    <td className="px-4 py-3 text-right text-body-reg text-on-surface-variant">{fmt(Number(c.initialValue))}</td>
                    <td className="px-4 py-3 text-right font-body-semibold text-on-surface">{fmt(Number(c.currentBalance))}</td>
                    <td className="px-4 py-3 text-body-reg text-on-surface-variant">
                      {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-KE') : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">{statusBadge(c.status)}</td>
                    <td className="px-4 py-3 text-right">
                      {c.status === 'ACTIVE' && (
                        <button onClick={() => setRedeemTarget(c)}
                          className="px-3 py-1 bg-primary text-on-primary rounded text-xs font-bold hover:brightness-110 transition-all">
                          Redeem
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

      <ConfirmModal
        open={!!redeemTarget}
        title="Redeem Gift Card"
        message={`Fully redeem gift card ${redeemTarget?.code} with a current balance of ${fmt(Number(redeemTarget?.currentBalance || 0))}? This will zero the balance and mark it as redeemed.`}
        confirmLabel="Redeem"
        onConfirm={handleRedeem}
        onCancel={() => setRedeemTarget(null)}
        loading={redeeming}
      />
    </div>
  );
}