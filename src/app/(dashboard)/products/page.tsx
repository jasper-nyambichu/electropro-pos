"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { productsApi, ApiError, ProductResponseDto } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StockCell({ product }: { product: ProductResponseDto }) {
  if (product.quantity <= 0) {
    return (
      <div className="flex items-center gap-2 text-error">
        <div className="w-2 h-2 rounded-full bg-error flex-shrink-0" />
        <span className="text-body-reg">Out of Stock</span>
      </div>
    );
  }
  if (product.quantity <= product.lowStockThreshold) {
    return (
      <div className="flex items-center gap-2 text-primary">
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
        <span className="text-body-reg">{product.quantity} Units</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-on-surface">
      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
      <span className="text-body-reg">{product.quantity} Units</span>
    </div>
  );
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="bg-secondary-container text-on-secondary-container text-[11px] font-bold px-2 py-0.5 rounded uppercase">
      {label}
    </span>
  );
}

function ProductImage({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className="w-12 h-12 object-cover rounded border border-outline-variant/20 shadow-sm"
      />
    );
  }
  return (
    <div className="w-12 h-12 bg-surface-variant flex items-center justify-center rounded">
      <span className="material-symbols-outlined text-secondary">image</span>
    </div>
  );
}

const PAGE_SIZE = 10;

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");

  async function loadProducts() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await productsApi.list();
      setProducts(data);
    } catch (err) {
      setLoadError(
        err instanceof ApiError
          ? `Failed to load products: ${err.message}`
          : "Failed to load products. Check your connection to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(products.map((p) => p.categoryName).filter(Boolean) as string[])
      ),
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "" || p.categoryName === category;
      const status =
        p.quantity <= 0
          ? "out-of-stock"
          : p.quantity <= p.lowStockThreshold
          ? "low-stock"
          : "in-stock";
      const matchesStatus = stockStatus === "" || status === stockStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, stockStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pageProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ── Selection helpers ──
  const allSelected =
    pageProducts.length > 0 && pageProducts.every((p) => selectedIds.has(p.id));

  function toggleAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageProducts.forEach((p) => next.delete(p.id));
      } else {
        pageProducts.forEach((p) => next.add(p.id));
      }
      return next;
    });
  }

  function toggleRow(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Delete (real API call) ──
  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await productsApi.remove(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success(`"${name}" was deleted.`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? `Could not delete product: ${err.message}`
          : "Could not delete product. Check your connection to the server.";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <>
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">
            All Products
          </h1>
          <nav className="flex text-label-sm text-secondary gap-2 mt-1">
            <a href="/dashboard" className="hover:text-primary transition-colors">
              Inventory
            </a>
            <span>/</span>
            <span className="text-on-surface font-bold">Products List</span>
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/products/add"
            className="bg-primary hover:opacity-90 text-on-primary px-4 py-2 rounded-sm shadow-sm transition-opacity flex items-center gap-2 text-body-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Product
          </Link>
        </div>
      </div>

      {loadError && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 mb-4 text-label-sm flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={loadProducts} className="font-bold underline">
            Retry
          </button>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-lg p-[15px] mb-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[15px]">
          {/* Search */}
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-body-semibold text-secondary">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by SKU or Name"
                className="w-full border border-outline-variant/30 rounded-sm px-3 py-2 text-body-reg text-on-surface placeholder:text-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-secondary text-[20px] pointer-events-none">
                search
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-body-semibold text-secondary">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-outline-variant/30 rounded-sm px-3 py-2 text-body-reg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status */}
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-body-semibold text-secondary">
              Stock Status
            </label>
            <select
              value={stockStatus}
              onChange={(e) => {
                setStockStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-outline-variant/30 rounded-sm px-3 py-2 text-body-reg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">All Statuses</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Products Table ── */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-high border-b border-outline-variant/10">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-outline-variant text-primary focus:ring-primary"
                  />
                </th>
                {["Image", "SKU", "Product Details", "Category", "Price", "Stock", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      className="p-4 font-panel-header text-panel-header text-secondary uppercase tracking-tight whitespace-nowrap"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-secondary">
                    Loading products…
                  </td>
                </tr>
              )}

              {!loading && pageProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-secondary">
                    No products match this filter.
                  </td>
                </tr>
              )}

              {!loading &&
                pageProducts.map((product, i) => {
                  const isSelected = selectedIds.has(product.id);
                  const isEven = i % 2 === 1;
                  return (
                    <tr
                      key={product.id}
                      onClick={() => toggleRow(product.id)}
                      className={[
                        "hover:bg-surface-container transition-colors cursor-pointer",
                        isEven ? "bg-surface-container-low" : "",
                        isSelected ? "bg-secondary-container/10" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {/* Checkbox */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(product.id)}
                          className="rounded border-outline-variant text-primary focus:ring-primary"
                        />
                      </td>

                      {/* Image */}
                      <td className="p-4">
                        <ProductImage src={product.imageUrl} alt={product.name} />
                      </td>

                      {/* SKU */}
                      <td className="p-4 text-label-sm text-secondary whitespace-nowrap">
                        {product.sku}
                      </td>

                      {/* Product Details */}
                      <td className="p-4">
                        <span className="text-body-semibold text-on-surface">
                          {product.name}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <CategoryBadge label={product.categoryName ?? "Uncategorized"} />
                      </td>

                      {/* Price */}
                      <td className="p-4 text-body-semibold text-primary whitespace-nowrap">
                        KES {product.price.toLocaleString()}
                      </td>

                      {/* Stock */}
                      <td className="p-4">
                        <StockCell product={product} />
                      </td>

                      {/* Actions */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/products/${product.id}/edit`}
                            className="p-1.5 hover:bg-primary-container/10 text-secondary hover:text-primary transition-colors rounded-sm"
                            aria-label={`Edit ${product.name}`}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              edit
                            </span>
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deletingId === product.id}
                            className="p-1.5 hover:bg-error-container/20 text-secondary hover:text-error transition-colors rounded-sm disabled:opacity-40"
                            aria-label={`Delete ${product.name}`}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {deletingId === product.id ? "hourglass_empty" : "delete"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        {!loading && filteredProducts.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-outline-variant/10 flex-wrap gap-3">
            <p className="text-label-sm text-secondary">
              Showing{" "}
              <span className="font-bold text-on-surface">
                {(currentPage - 1) * PAGE_SIZE + 1} –{" "}
                {Math.min(currentPage * PAGE_SIZE, filteredProducts.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-on-surface">
                {filteredProducts.length}
              </span>{" "}
              products
            </p>

            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-outline-variant/20 rounded-sm hover:bg-surface-container text-secondary transition-colors disabled:opacity-40"
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chevron_left
                </span>
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={[
                    "px-3 py-1 border rounded-sm text-label-sm transition-colors",
                    currentPage === page
                      ? "border-primary bg-primary text-on-primary font-bold"
                      : "border-outline-variant/20 hover:bg-surface-container text-secondary",
                  ].join(" ")}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-outline-variant/20 rounded-sm hover:bg-surface-container text-secondary transition-colors disabled:opacity-40"
                aria-label="Next page"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}