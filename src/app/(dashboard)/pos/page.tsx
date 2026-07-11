// src/app/(dashboard)/pos/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  categoriesApi,
  productsApi,
  salesApi,
  ApiError,
  CategoryResponseDto,
  ProductResponseDto,
} from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface CartItem {
  product: ProductResponseDto;
  cartQty: number;
}

export default function POSPage() {
  const toast = useToast();
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState("All Products");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MPESA" | "CREDIT">("CASH");
  const [checkingOut, setCheckingOut] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [p, c] = await Promise.all([productsApi.list(), categoriesApi.list()]);
      setProducts(p);
      setCategories(c);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const categoryTabs = ["All Products", ...categories.map((c) => c.name)];

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== "All Products") {
      list = list.filter((p) => p.categoryName === activeCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, activeCategory, search]);

  function addToCart(product: ProductResponseDto) {
    if (product.quantity <= 0) {
      toast.error(`${product.name} is out of stock.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        if (existing.cartQty >= product.quantity) {
          toast.error(`Only ${product.quantity} of ${product.name} in stock.`);
          return prev;
        }
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, cartQty: c.cartQty + 1 } : c
        );
      }
      return [...prev, { product, cartQty: 1 }];
    });
  }

  function updateQty(id: number, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => (c.product.id === id ? { ...c, cartQty: c.cartQty + delta } : c))
        .filter((c) => c.cartQty > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  const subtotal = cart.reduce((s, c) => s + c.product.price * c.cartQty, 0);
  const vat = Math.round(subtotal * 0.16);
  const total = subtotal + vat;

  async function completeSale() {
    if (cart.length === 0) {
      toast.error("Cart is empty.");
      return;
    }
    setCheckingOut(true);
    try {
      const sale = await salesApi.create({ paymentMethod });
      for (const item of cart) {
        await salesApi.addItem({
          saleId: sale.id,
          productId: item.product.id,
          quantity: item.cartQty,
        });
      }
      toast.success(`Sale completed. Receipt ${sale.receiptNumber}.`);
      clearCart();
      await load(); // refresh stock levels
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not complete sale.");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-90px)] gap-0 -mx-5 -mt-5">
      {/* Left: Product Catalog */}
      <div className="flex flex-col w-full md:w-[65%] p-4 overflow-y-auto">
        {/* Search */}
        <div className="mb-4 space-y-3">
          <div className="relative bg-white border border-outline-variant/30 rounded-lg p-1 flex items-center shadow-sm">
            <span className="material-symbols-outlined text-secondary ml-3">barcode_scanner</span>
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 font-body-reg py-2 px-3"
              placeholder="Scan barcode or search product name..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {categoryTabs.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded text-label-sm font-body-semibold transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-white border border-outline-variant/30 text-secondary hover:bg-surface-container"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm mb-4">
            {error}
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <p className="p-6 text-center text-secondary">Loading products…</p>
        ) : filtered.length === 0 ? (
          <div className="border-2 border-dashed border-outline-variant/30 rounded-lg p-8 flex flex-col items-center justify-center text-secondary opacity-60">
            <p className="font-body-semibold">No products found</p>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((product) => (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white border border-outline-variant/30 rounded shadow-sm overflow-hidden cursor-pointer hover:border-primary transition-colors group"
              >
                <div className="h-32 bg-surface-container relative overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="160px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-secondary-container">
                      <span className="material-symbols-outlined text-[48px] text-outline-variant/40 group-hover:text-primary/20 transition-colors">
                        inventory_2
                      </span>
                    </div>
                  )}
                  <div
                    className={`absolute top-2 right-2 text-white text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      product.quantity <= product.lowStockThreshold ? "bg-error" : "bg-on-primary-fixed-variant"
                    }`}
                  >
                    {product.quantity <= product.lowStockThreshold
                      ? "Low Stock"
                      : `Qty: ${product.quantity}`}
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="font-body-semibold text-[13px] leading-tight mb-1">{product.name}</h3>
                  <div className="text-primary font-bold text-[14px]">
                    KES {product.price.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Cart */}
      <div className="hidden md:flex flex-col w-[35%] bg-white border-l border-outline-variant/30 shadow-2xl">
        {/* Cart Header */}
        <div className="p-4 border-b border-surface-variant flex justify-between items-center bg-surface-container-low">
          <div>
            <h2 className="font-panel-header text-panel-header">Current Sale</h2>
            <p className="text-label-sm text-secondary">
              {cart.length} item{cart.length === 1 ? "" : "s"} in cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-error flex items-center gap-1 hover:bg-error-container p-2 rounded transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            <span className="font-label-sm text-label-sm font-bold">CLEAR</span>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-secondary opacity-50">
              <span className="material-symbols-outlined text-[48px]">shopping_cart</span>
              <p className="text-label-sm mt-2">No items in cart</p>
              <p className="text-label-sm">Click a product to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-surface-bright border border-outline-variant/20 p-3 rounded flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <span className="font-body-semibold text-[13px] text-on-surface flex-1 pr-2">
                    {item.product.name}
                  </span>
                  <span className="font-body-semibold text-on-surface text-[13px]">
                    {(item.product.price * item.cartQty).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.product.id, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-surface-container rounded border border-outline-variant/30 hover:bg-error-container hover:text-error transition-colors"
                    >
                      -
                    </button>
                    <span className="w-10 h-6 flex items-center justify-center text-[12px] border border-outline-variant/30 rounded bg-white">
                      {item.cartQty}
                    </span>
                    <button
                      onClick={() => updateQty(item.product.id, 1)}
                      className="w-6 h-6 flex items-center justify-center bg-surface-container rounded border border-outline-variant/30 hover:bg-primary-container/20 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-label-sm text-secondary">
                    KES {item.product.price.toLocaleString()} ea
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sale Summary */}
        <div className="p-4 bg-on-secondary-fixed-variant text-on-primary">
          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-label-sm opacity-80">
              <span>Subtotal</span>
              <span>KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-label-sm opacity-80">
              <span>VAT (16%)</span>
              <span>KES {vat.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-end pt-2 border-t border-white/10">
              <span className="font-bold text-lg">TOTAL KES</span>
              <span className="font-bold text-2xl">{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(["CASH", "MPESA", "CREDIT"] as const).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`flex flex-col items-center justify-center py-3 rounded border transition-all ${
                  paymentMethod === method
                    ? "bg-white/30 border-white"
                    : "bg-white/10 hover:bg-white/20 border-white/20"
                }`}
              >
                <span className="material-symbols-outlined mb-1">
                  {method === "CASH" ? "payments" : method === "MPESA" ? "smartphone" : "credit_card"}
                </span>
                <span className="text-[11px] font-bold">{method}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={completeSale}
              disabled={checkingOut || cart.length === 0}
              className="w-full bg-[#28a745] hover:bg-[#218838] py-4 rounded text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span className="material-symbols-outlined">check_circle</span>
              {checkingOut ? "PROCESSING…" : "COMPLETE SALE (F10)"}
            </button>
            <button className="w-full bg-white text-primary hover:bg-surface-container py-3 rounded font-bold border border-primary transition-all active:scale-[0.98]">
              SAVE AS QUOTATION
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav for POS */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-on-secondary-fixed-variant flex justify-around items-center h-14 z-50 text-white">
        <button className="flex flex-col items-center gap-0.5 opacity-60">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px]">Home</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-primary">
          <span className="material-symbols-outlined">point_of_sale</span>
          <span className="text-[10px]">POS</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 opacity-60 relative">
          <span className="material-symbols-outlined">shopping_cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[9px] flex items-center justify-center font-bold">
              {cart.length}
            </span>
          )}
          <span className="text-[10px]">Cart</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 opacity-60">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px]">Menu</span>
        </button>
      </div>
    </div>
  );
}