'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productApi, type ProductResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import TableSkeleton from '@/components/ui/TableSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function ProductsPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [filtered, setFiltered] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? products.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.sku.toLowerCase().includes(q) ||
              p.categoryName?.toLowerCase().includes(q)
          )
        : products
    );
    setPage(1);
  }, [search, products]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const data = await productApi.getAll();
      setProducts(data);
      setFiltered(data);
    } catch (err: unknown) {
      error('Failed to load products', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productApi.delete(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      success('Product deleted', `${deleteTarget.name} has been removed.`);
      setDeleteTarget(null);
    } catch (err: unknown) {
      error('Delete failed', err instanceof Error ? err.message : undefined);
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function stockBadge(p: ProductResponse) {
    if (p.quantity <= 0)
      return <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-error text-on-error">Out of Stock</span>;
    if (p.quantity <= p.lowStockThreshold)
      return <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">Low Stock</span>;
    return <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-green-100 text-green-800 border border-green-200">In Stock</span>;
  }

  return (
    <div className="p-container_padding">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Products</h1>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            {products.length} product{products.length !== 1 ? 's' : ''} in inventory
          </p>
        </div>
        <button
          onClick={() => router.push('/products/add')}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body-semibold text-body-semibold flex items-center gap-2 hover:brightness-110 transition-all shadow-sm self-start"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Product
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-[18px]">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or category…"
            className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg text-body-reg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
        <button
          onClick={() => router.push('/products/low-stock')}
          className="flex items-center gap-2 px-4 py-2 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-lg text-body-semibold text-sm hover:bg-yellow-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">warning</span>
          Low Stock Alerts
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-outline-variant/30 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">inventory_2</span>
          <span className="font-panel-header text-panel-header">Product List</span>
        </div>

        {loading ? (
          <TableSkeleton rows={8} columns={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="inventory_2"
            title={search ? 'No products match your search' : 'No products yet'}
            description={search ? 'Try a different search term.' : 'Add your first product to start managing inventory.'}
            actionLabel={search ? undefined : 'Add Product'}
            onAction={search ? undefined : () => router.push('/products/add')}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container border-b border-outline-variant/20">
                  <tr>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Product</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">SKU</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant">Category</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Price</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-center">Stock</th>
                    <th className="px-4 py-3 font-panel-header text-panel-header text-on-surface-variant text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {paginated.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`hover:bg-surface-container-low transition-colors cursor-pointer ${idx % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-white'}`}
                      onClick={() => router.push(`/products/${p.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded object-cover border border-outline-variant/20 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-on-surface-variant/30 text-xl">image</span>
                            </div>
                          )}
                          <span className="font-body-semibold text-on-surface">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-body-reg text-on-surface-variant">{p.sku}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded-full bg-secondary-container text-on-secondary-container">
                          {p.categoryName || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-body-semibold text-on-surface">
                        KES {Number(p.price).toLocaleString('en-KE')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-body-semibold text-on-surface">{p.quantity}</span>
                          {stockBadge(p)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/products/${p.id}`)}
                            className="p-1.5 hover:bg-surface-container rounded transition-colors"
                            title="View"
                          >
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">visibility</span>
                          </button>
                          <button
                            onClick={() => router.push(`/products/edit/${p.id}`)}
                            className="p-1.5 hover:bg-surface-container rounded transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 hover:bg-error-container rounded transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[18px] text-error">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between">
                <span className="text-label-sm text-on-surface-variant">
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-outline-variant bg-white rounded text-label-sm hover:bg-surface-container disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`px-3 py-1 border rounded text-label-sm transition-colors ${
                        n === page
                          ? 'bg-primary text-on-primary border-primary font-bold'
                          : 'bg-white border-outline-variant hover:bg-surface-container'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border border-outline-variant bg-white rounded text-label-sm hover:bg-surface-container disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Product"
        message={`This action cannot be undone. "${deleteTarget?.name}" will be permanently removed from your inventory.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}