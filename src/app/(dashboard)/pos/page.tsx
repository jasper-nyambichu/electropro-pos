'use client';

import { useEffect, useState, useCallback } from 'react';
import { productApi, saleApi, type ProductResponse, type SaleResponse } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import TableSkeleton from '@/components/ui/TableSkeleton';
import ReceiptModal from '@/components/pos/ReceiptModal';

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

const VAT_RATE = 0.16;
const PAYMENT_METHODS = ['CASH', 'MPESA', 'CARD'] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export default function POSPage() {
  const { success, error } = useToast();

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [filtered, setFiltered] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  const [completedSale, setCompletedSale] = useState<SaleResponse | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptItems, setReceiptItems] = useState<CartItem[]>([]);

  useEffect(() => {
    productApi.getAll()
      .then((data) => {
        setProducts(data);
        setFiltered(data);
        const cats = ['All', ...Array.from(new Set(data.map((p) => p.categoryName).filter(Boolean)))];
        setCategories(cats);
      })
      .catch((err: unknown) => error('Failed to load products', err instanceof Error ? err.message : undefined))
      .finally(() => setLoadingProducts(false));
  }, []);

  const applyFilters = useCallback(
    (searchVal: string, cat: string) => {
      let result = products;
      if (cat !== 'All') result = result.filter((p) => p.categoryName === cat);
      if (searchVal.trim()) {
        const q = searchVal.toLowerCase();
        result = result.filter(
          (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
        );
      }
      setFiltered(result);
    },
    [products]
  );

  function handleSearch(val: string) {
    setSearch(val);
    applyFilters(val, activeCategory);
  }

  function handleCategory(cat: string) {
    setActiveCategory(cat);
    applyFilters(search, cat);
  }

  function addToCart(product: ProductResponse) {
    if (product.quantity <= 0) {
      error('Out of stock', `${product.name} is not available.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          error('Stock limit', `Only ${product.quantity} units available.`);
          return prev;
        }
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: Number(product.price),
          subtotal: Number(product.price),
        },
      ];
    });
  }

  function updateQty(productId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: i.quantity + delta, subtotal: (i.quantity + delta) * i.unitPrice }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clearCart() {
    setCart([]);
    setGiftCardCode('');
  }

  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  const fmt = (n: number) =>
    `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

  async function handleCheckout() {
    if (cart.length === 0) { error('Empty cart', 'Add at least one product.'); return; }
    setCheckingOut(true);
    try {
      const sale = await saleApi.create({ paymentMethod });
      setCompletedSale(sale);
      setReceiptItems([...cart]);
      setReceiptOpen(true);
      success('Sale completed', `Receipt ${sale.receiptNumber} generated.`);
      clearCart();
    } catch (err: unknown) {
      error('Checkout failed', err instanceof Error ? err.message : undefined);
    } finally {
      setCheckingOut(false);
    }
  }

  function handleNewSale() {
    setReceiptOpen(false);
    setCompletedSale(null);
    setReceiptItems([]);
  }

  function stockBadge(p: ProductResponse) {
    if (p.quantity <= 0)
      return <span className="absolute top-2 right-2 bg-error text-on-error text-[10px] px-1.5 py-0.5 rounded font-bold">Out</span>;
    if (p.quantity <= p.lowStockThreshold)
      return <span className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">Low</span>;
    return <span className="absolute top-2 right-2 bg-on-secondary-fixed text-white text-[10px] px-1.5 py-0.5 rounded font-bold">{p.quantity}</span>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-90px)]">
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Product Catalog ── */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-background">

          {/* Search */}
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-[18px]">
              barcode_scanner
            </span>
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Scan barcode or search product name…"
              className="w-full pl-10 pr-4 py-2.5 border border-outline-variant bg-white rounded-lg text-body-reg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-label-sm font-bold uppercase whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-white border border-outline-variant text-secondary hover:bg-surface-container'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product grid */}
          {loadingProducts ? (
            <TableSkeleton rows={4} columns={3} />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-3 opacity-30">inventory_2</span>
              <p className="font-semibold">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={p.quantity <= 0}
                  className={`relative bg-white border rounded-lg overflow-hidden text-left hover:border-primary hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed ${
                    cart.some((i) => i.productId === p.id)
                      ? 'border-primary ring-1 ring-primary'
                      : 'border-outline-variant/30'
                  }`}
                >
                  <div className="h-28 bg-surface-container relative overflow-hidden">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-outline-variant/40">image</span>
                      </div>
                    )}
                    {stockBadge(p)}
                    {cart.some((i) => i.productId === p.id) && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="font-body-semibold text-[13px] text-on-surface leading-tight line-clamp-2">{p.name}</p>
                    <p className="text-primary font-bold text-sm mt-1">
                      KES {Number(p.price).toLocaleString('en-KE')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Cart Panel ── */}
        <div className="w-[360px] shrink-0 bg-[#1c222b] text-white flex flex-col border-l border-white/10">

          {/* Cart header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div>
              <h2 className="font-panel-header text-panel-header text-white">Current Sale</h2>
              <p className="text-[11px] text-white/50 mt-0.5">{cart.length} item{cart.length !== 1 ? 's' : ''} in cart</p>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1 text-error hover:bg-error/20 px-2 py-1 rounded transition-colors text-xs font-bold uppercase"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                Clear
              </button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-12">
                <span className="material-symbols-outlined text-5xl mb-3">shopping_basket</span>
                <p className="font-semibold text-sm">Cart is empty</p>
                <p className="text-xs mt-1">Tap a product to add it</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-body-semibold text-[13px] text-white leading-tight flex-1 pr-2">
                      {item.productName}
                    </p>
                    <button onClick={() => removeFromCart(item.productId)}
                      className="text-white/30 hover:text-error transition-colors shrink-0">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.productId, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-white/10 rounded hover:bg-white/20 transition-colors font-bold">
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white/10 rounded hover:bg-white/20 transition-colors font-bold">
                        +
                      </button>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {fmt(item.subtotal)}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">
                    {fmt(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Summary & payment */}
          <div className="p-4 border-t border-white/10 bg-black/20">
            {/* Totals */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-sm text-white/60">
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-white/60">
                <span>VAT (16%)</span><span>{fmt(vat)}</span>
              </div>
              <div className="flex justify-between items-end pt-2 border-t border-white/10">
                <span className="font-bold text-white/80 text-sm uppercase">Total</span>
                <span className="font-bold text-2xl text-white">{fmt(total)}</span>
              </div>
            </div>

            {/* Payment methods */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all text-[11px] font-bold tracking-widest ${
                    paymentMethod === m
                      ? 'bg-primary border-primary text-on-primary'
                      : 'bg-white/10 border-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] mb-1">
                    {m === 'MPESA' ? 'smartphone' : m === 'CARD' ? 'credit_card' : 'payments'}
                  </span>
                  {m}
                </button>
              ))}
            </div>

            {/* Gift card */}
            <div className="flex gap-2 mb-4">
              <input
                value={giftCardCode}
                onChange={(e) => setGiftCardCode(e.target.value)}
                placeholder="Gift card code (optional)"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:ring-1 focus:ring-primary outline-none"
              />
              {giftCardCode && (
                <button className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-xs font-bold text-white/70 hover:bg-white/20 transition-colors">
                  Apply
                </button>
              )}
            </div>

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || checkingOut}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {checkingOut ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                  Processing…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                  Complete Sale
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ReceiptModal
        open={receiptOpen}
        sale={completedSale}
        items={receiptItems}
        onClose={() => setReceiptOpen(false)}
        onNewSale={handleNewSale}
      />
    </div>
  );
}