"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number | null; // null = out of stock
  stockStatus: StockStatus;
  image: string | null; // null = placeholder icon
}

// ─── Static seed data (replace with real fetch/server data as needed) ────────

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    sku: "TV-SAM-55-CU7K",
    name: 'Samsung 55" CU7000',
    brand: "Samsung",
    category: "Televisions",
    price: 84999,
    stock: 24,
    stockStatus: "in-stock",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABjzKGZzU8FiNmBEFk2spQJYfyXnJy8CdBdXXG7AQop1LRWnRKJUja80RKM-Y8WSAk5T3RT0KffzToXb3JufRKvo4ZlGH8Dw6NxQ8jUUqRGoEkiZ205Z32WiRsZiSkcfvk3hPobRc2yVwUPBSj571zF17zmJgAmfp4jav1xWHoe4btA0qCd08VP1yEaJ12gExwVz7SJYcrnCxxA-qE7mM7PuVd3q2fK37dleepwxjzmMb105wgFJz6uongLzC_5YcAAZGlTTX6BRht",
  },
  {
    id: "2",
    sku: "TV-LG-43-LM63",
    name: 'LG 43" LM6370',
    brand: "LG",
    category: "Televisions",
    price: 48500,
    stock: 5,
    stockStatus: "low-stock",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDnrbLQ9BNkxODfb4hYLgkPSmWFKj9MTOJ6RufP6zxYUZByQtylHlWJaylMHtrr36YBjVmIKg5_cC4P_YM8mhVDxVRZfmG9RE5BuDmcAt-SNjKeNfYasJGrVvPfwvOeuvh0KPQAmeKHs5fO5ZuhXnKTMRiz-6-bHhQeeNWG_5YnCpc6CwFc2feXQ3MIJMcsy16u0_d-iwBnwGq6HdUSPrN4g4SKy9ONsir1IusboGdJ6x8YPoj9TuIh5sIbIk6quliL-YL_g8WYT3OW",
  },
  {
    id: "3",
    sku: "TV-SON-65-X80",
    name: 'Sony BRAVIA 65" X80L',
    brand: "Sony",
    category: "Televisions",
    price: 145000,
    stock: 12,
    stockStatus: "in-stock",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuArDsG0qYPB_ugVw5i3Mcx-nG02NcNo367dwEAnvVY39K0eUsHh4Q3sruW5kQU3BSR_SU0m0frfJF3qAAiAbone3QgPj1048D8gzxIMO_knItuZNNkgA79IVB7WXHB5w12TfU5fGILkP3N_WLlhjayGh5ijaeGbcCpuCPyynlY8BBRITdPHvQxAw277n2nuTA894sSD-s4PpyORlTb9H3SNlwz20TK7szCwmygVTc6p2O2SVGA47rwUqSOJPwMewaND18FIZUUSZTdd",
  },
  {
    id: "4",
    sku: "PH-APP-15P-256",
    name: "iPhone 15 Pro 256GB",
    brand: "Apple",
    category: "Smartphones",
    price: 185000,
    stock: null,
    stockStatus: "out-of-stock",
    image: null,
  },
  {
    id: "5",
    sku: "LP-DEL-XPS-13",
    name: "Dell XPS 13 9315",
    brand: "Dell",
    category: "Laptops",
    price: 165000,
    stock: 18,
    stockStatus: "in-stock",
    image: null,
  },
  {
    id: "6",
    sku: "AU-SNY-WH1K-M5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Audio",
    price: 42000,
    stock: 32,
    stockStatus: "in-stock",
    image: null,
  },
  {
    id: "7",
    sku: "PH-SAM-S24U",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Smartphones",
    price: 158500,
    stock: 2,
    stockStatus: "low-stock",
    image: null,
  },
  {
    id: "8",
    sku: "LP-MAC-M3-14",
    name: 'MacBook Pro 14" M3',
    brand: "Apple",
    category: "Laptops",
    price: 265000,
    stock: 8,
    stockStatus: "in-stock",
    image: null,
  },
  {
    id: "9",
    sku: "AU-APP-AIRP-PRO",
    name: "Apple AirPods Pro (2nd)",
    brand: "Apple",
    category: "Audio",
    price: 32500,
    stock: 45,
    stockStatus: "in-stock",
    image: null,
  },
  {
    id: "10",
    sku: "PH-XIA-RED-13",
    name: "Redmi Note 13 Pro",
    brand: "Xiaomi",
    category: "Smartphones",
    price: 38000,
    stock: 60,
    stockStatus: "in-stock",
    image: null,
  },
];

const TOTAL_PRODUCTS = 248;
const TOTAL_PAGES = 25;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StockCell({
  product,
}: {
  product: Product;
}) {
  if (product.stockStatus === "out-of-stock") {
    return (
      <div className="flex items-center gap-2 text-error">
        <div className="w-2 h-2 rounded-full bg-error flex-shrink-0" />
        <span className="text-body-reg">Out of Stock</span>
      </div>
    );
  }
  if (product.stockStatus === "low-stock") {
    return (
      <div className="flex items-center gap-2 text-primary">
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
        <span className="text-body-reg">{product.stock} Units</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-on-surface">
      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
      <span className="text-body-reg">{product.stock} Units</span>
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

function ProductImage({ src, alt }: { src: string | null; alt: string }) {
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [stockStatus, setStockStatus] = useState("");

  // ── Selection helpers ──
  const allSelected =
    products.length > 0 && selectedIds.size === products.length;

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Actions (stubs — wire to your API/server actions) ──
  function handleDelete(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  // ── Pagination ──
  const pageNumbers = [1, 2, 3, "...", TOTAL_PAGES];

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
          <button className="bg-on-secondary-fixed-variant hover:bg-on-secondary-fixed text-on-primary px-4 py-2 rounded-sm shadow-sm transition-colors flex items-center gap-2 text-body-semibold">
            <span className="material-symbols-outlined text-[18px]">
              upload_file
            </span>
            Import CSV
          </button>
          <button className="bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary px-4 py-2 rounded-sm shadow-sm transition-colors flex items-center gap-2 text-body-semibold">
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Export
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-lg p-[15px] mb-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[15px]">
          {/* Search */}
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-body-semibold text-secondary">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-outline-variant/30 rounded-sm px-3 py-2 text-body-reg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">All Categories</option>
              <option>Televisions</option>
              <option>Smartphones</option>
              <option>Laptops</option>
              <option>Audio</option>
            </select>
          </div>

          {/* Brand */}
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-body-semibold text-secondary">
              Brand
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full border border-outline-variant/30 rounded-sm px-3 py-2 text-body-reg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">All Brands</option>
              <option>Samsung</option>
              <option>LG</option>
              <option>Sony</option>
              <option>Apple</option>
            </select>
          </div>

          {/* Stock Status */}
          <div className="flex flex-col gap-1">
            <label className="text-label-sm font-body-semibold text-secondary">
              Stock Status
            </label>
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value)}
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
              {products.map((product, i) => {
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
                      <ProductImage src={product.image} alt={product.name} />
                    </td>

                    {/* SKU */}
                    <td className="p-4 text-label-sm text-secondary whitespace-nowrap">
                      {product.sku}
                    </td>

                    {/* Product Details */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-body-semibold text-on-surface">
                          {product.name}
                        </span>
                        <span className="text-label-sm text-secondary">
                          {product.brand}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <CategoryBadge label={product.category} />
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
                    <td
                      className="p-4"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 hover:bg-error-container/20 text-secondary hover:text-error transition-colors rounded-sm"
                          aria-label={`Delete ${product.name}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            delete
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
        <div className="px-4 py-3 flex items-center justify-between border-t border-outline-variant/10 flex-wrap gap-3">
          <p className="text-label-sm text-secondary">
            Showing{" "}
            <span className="font-bold text-on-surface">
              {(currentPage - 1) * 10 + 1} –{" "}
              {Math.min(currentPage * 10, TOTAL_PRODUCTS)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-on-surface">{TOTAL_PRODUCTS}</span>{" "}
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

            {pageNumbers.map((page, i) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-3 py-1 border border-outline-variant/20 rounded-sm text-label-sm text-secondary flex items-center"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(Number(page))}
                  className={[
                    "px-3 py-1 border rounded-sm text-label-sm transition-colors",
                    currentPage === page
                      ? "border-primary bg-primary text-on-primary font-bold"
                      : "border-outline-variant/20 hover:bg-surface-container text-secondary",
                  ].join(" ")}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))
              }
              disabled={currentPage === TOTAL_PAGES}
              className="p-2 border border-outline-variant/20 rounded-sm hover:bg-surface-container text-secondary transition-colors disabled:opacity-40"
              aria-label="Next page"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}