'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { purchaseOrderApi, type PurchaseOrderResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import TableSkeleton from '@/components/ui/TableSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function PurchasesPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [orders, setOrders] = useState<PurchaseOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiveTarget, setReceiveTarget] = useState<PurchaseOrderResponse | null>(null);
  const [receiving, setReceiving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrderResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    purchaseOrderApi.getAll()
      .then(setOrders)
      .catch((err: unknown) => error('Failed to load purchase orders', err instanceof Error ? err.message : undefined))
      .finally(() => setLoading(false));
  }, []);

  async function handleReceive() {
    if (!receiveTarget) return;
    setReceiving(true);
    try {
      const updated = await purchaseOrderApi.receive(receiveTarget.id);
      setOrders((prev) => prev.map((o) => (o.id === receiveTarget.id ? updated : o)));
      success('Order received', `Purchase order #${receiveTarget.id} marked as received.`);
      setReceiveTarget(null);
    } catch (err: unknown) {
      error('Failed', err instanceof Error ? err.message : undefined);
    } finally {
      setReceiving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await purchaseOrderApi.delete(deleteTarget.id);
      setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      success('Order cancelled', `Purchase order #${deleteTarget.id} has been removed.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      error('Delete failed', err instanceof Error ? err.message : undefined);
    } finally {
      setDeleting(false);
    }
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      RECEIVED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    };
    return (
      <span className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded-full border ${map[status] ?? 'bg-surface-container text-on-surface-variant'}`}>
        {status}
      </span>
    );
  }

  const fmt = (n: number) =>
    `KES ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

  const totalPages = Math.ceil(orders.length / PER_PAGE);
  const paginated = orders.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-container_padding">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Purchase Orders</h1>
          <p className="text-label-sm text-on-surface-variant mt-0.5">{orders.length} orders</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/purchases/suppliers')}
            className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-lg font-body-semibold flex items-center gap-2 hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            Suppliers
          </button>
          <button onClick={() => router.push('/purchases/add')}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body-semibold flex items-center gap-2 hover:brightness-110 transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Order
          </button>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">shopping_cart</span>
          <span className="font-panel-header text-panel-header">Purchase Orders</span>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : orders.length === 0 ? (
          <EmptyState icon="shopping_cart" title="No purchase orders yet"
            description="Create your first purchase order to start tracking supplier deliveries."
            actionLabel="New Order" onAction={() => router.push('/purchases/add')} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container border-b border-outline-variant/20">
                  <tr>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Order #</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Supplier</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Order Date</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Total</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-center">Status</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {paginated.map((o, idx) => (
                    <tr key={o.id}
                      className={`hover:bg-surface-container-low transition-colors ${idx % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-white'}`}>
                      <td className="px-4 py-3 font-body-semibold text-primary">#{o.id}</td>
                      <td className="px-4 py-3 text-body-reg text-on-surface">{o.supplierName}</td>
                      <td className="px-4 py-3 text-body-reg text-on-surface-variant">
                        {o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-body-semibold text-on-surface">
                        {fmt(Number(o.totalAmount || 0))}
                      </td>
                      <td className="px-4 py-3 text-center">{statusBadge(o.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {o.status === 'PENDING' && (
                            <button onClick={() => setReceiveTarget(o)}
                              className="px-2 py-1 text-xs font-bold bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
                              Receive
                            </button>
                          )}
                          {o.status === 'PENDING' && (
                            <button onClick={() => setDeleteTarget(o)}
                              className="p-1.5 hover:bg-error-container rounded transition-colors">
                              <span className="material-symbols-outlined text-[18px] text-error">cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between">
                <span className="text-label-sm text-on-surface-variant">
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, orders.length)} of {orders.length}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1 border border-outline-variant bg-white rounded text-label-sm hover:bg-surface-container disabled:opacity-40 transition-colors">Previous</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
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
        open={!!receiveTarget}
        title="Mark as Received"
        message={`Confirm that purchase order #${receiveTarget?.id} from ${receiveTarget?.supplierName} has been received and stock has been updated.`}
        confirmLabel="Mark Received"
        onConfirm={handleReceive}
        onCancel={() => setReceiveTarget(null)}
        loading={receiving}
      />
      <ConfirmModal
        open={!!deleteTarget}
        title="Cancel Order"
        message={`Purchase order #${deleteTarget?.id} will be permanently cancelled and removed.`}
        confirmLabel="Cancel Order"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}