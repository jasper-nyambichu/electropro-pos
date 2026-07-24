'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { customerApi, type CustomerResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { isManagerOrAbove } from '@/lib/auth';
import TableSkeleton from '@/components/ui/TableSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';

function initials(c: CustomerResponse) {
  return `${c.firstname[0] ?? ''}${c.lastname[0] ?? ''}`.toUpperCase();
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
];

export default function CustomersPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [filtered, setFiltered] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CustomerResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [canDelete, setCanDelete] = useState(false);
  const PER_PAGE = 10;

  useEffect(() => {
    fetchCustomers();
    setCanDelete(isManagerOrAbove());
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? customers.filter(
            (c) =>
              c.firstname.toLowerCase().includes(q) ||
              c.lastname.toLowerCase().includes(q) ||
              c.email.toLowerCase().includes(q) ||
              c.phone?.toLowerCase().includes(q)
          )
        : customers
    );
    setPage(1);
  }, [search, customers]);

  async function fetchCustomers() {
    setLoading(true);
    try {
      setCustomers(await customerApi.getAll());
    } catch (err: unknown) {
      error('Failed to load customers', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await customerApi.delete(deleteTarget.id);
      setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      success('Customer deleted', `${deleteTarget.firstname} ${deleteTarget.lastname} has been removed.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      error('Delete failed', err instanceof Error ? err.message : undefined);
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="p-container_padding">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Customers</h1>
          <p className="text-label-sm text-on-surface-variant mt-0.5">{customers.length} registered customers</p>
        </div>
        <button
          onClick={() => router.push('/customers/add')}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body-semibold flex items-center gap-2 hover:brightness-110 transition-all shadow-sm self-start"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm p-4 mb-4">
        <div className="relative max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-[18px]">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-body-reg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">group</span>
          <span className="font-panel-header text-panel-header">Customer Directory</span>
        </div>

        {loading ? (
          <TableSkeleton rows={8} columns={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="person"
            title={search ? 'No customers match your search' : 'No customers yet'}
            description={search ? 'Try a different search term.' : 'Add your first customer to start tracking relationships.'}
            actionLabel={search ? undefined : 'Add Customer'}
            onAction={search ? undefined : () => router.push('/customers/add')}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container border-b border-outline-variant/20">
                  <tr>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Customer</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Email</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Phone</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Address</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {paginated.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-surface-container-low transition-colors cursor-pointer ${idx % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-white'}`}
                      onClick={() => router.push(`/customers/${c.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${AVATAR_COLORS[c.id % AVATAR_COLORS.length]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                            {initials(c)}
                          </div>
                          <span className="font-body-semibold text-on-surface">
                            {c.firstname} {c.lastname}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-body-reg text-on-surface-variant">{c.email}</td>
                      <td className="px-4 py-3 text-body-reg text-on-surface-variant">{c.phone || '—'}</td>
                      <td className="px-4 py-3 text-body-reg text-on-surface-variant truncate max-w-[180px]">{c.address || '—'}</td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => router.push(`/customers/${c.id}`)}
                            className="p-1.5 hover:bg-surface-container rounded transition-colors" title="View">
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">visibility</span>
                          </button>
                          {canDelete && (
                            <button onClick={() => setDeleteTarget(c)}
                              className="p-1.5 hover:bg-error-container rounded transition-colors" title="Delete">
                              <span className="material-symbols-outlined text-[18px] text-error">delete</span>
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
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1 border border-outline-variant bg-white rounded text-label-sm hover:bg-surface-container disabled:opacity-40 transition-colors">
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`px-3 py-1 border rounded text-label-sm transition-colors ${n === page ? 'bg-primary text-on-primary border-primary font-bold' : 'bg-white border-outline-variant hover:bg-surface-container'}`}>
                      {n}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1 border border-outline-variant bg-white rounded text-label-sm hover:bg-surface-container disabled:opacity-40 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {canDelete && (
        <ConfirmModal
          open={!!deleteTarget}
          title="Delete Customer"
          message={`"${deleteTarget?.firstname} ${deleteTarget?.lastname}" will be permanently removed along with their associated records.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}