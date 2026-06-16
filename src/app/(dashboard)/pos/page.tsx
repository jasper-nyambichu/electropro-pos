"use client";

import { useState } from "react";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  price: number;
  qty: number;
  category: string;
  image?: string;
  icon?: string;
}

interface CartItem extends Product {
  cartQty: number;
}

const CATEGORIES = ["All Products", "TVs", "PA Systems", "Audio", "Power", "Accessories"];

const PRODUCTS: Product[] = [
  { id: 1, name: 'Samsung 55" UHD Smart TV', price: 78000, qty: 8, category: "TVs", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJNHX1Ax3zh1Xo8xR58d1bpA7xXsnnFRBpddIiqNRgh2tyA3dAQ1TCItlmR__7ds8pZwvF2rW3ACpAbb9mBXqM0Yt2xQqsQ3FbaZ-kWlOg-sZ3oLDck3qeaRDibyzsuo7tsmgKzLT2vluNj150bLHti5uziRqZUh8mTBuXnVkyazoT2t4qWcp_mRQQmzvm068Z9eMLydeijzB7s5dBmy85D_3iwoRBij1Ud6bh2wwC9jn0QsyXvAPPjuP72pyvuK5xv5PW3Rs3wybz" },
  { id: 2, name: "Yamaha DBR12 Powered Spk", price: 55000, qty: 3, category: "PA Systems", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHo6LIf_401njxx0bxxLFBFynyOtkbEnzlJIYzLcvDOHpTFJDoEdDmuXYgyNmyYLL7DL9qtxH-HOAc9JF_rR0nWDu9XyuxGEMiN6TvUacXsYLxIdpmmT16Cjda6GZ6EQELt4fVztMy6-tLEuthw9O5kURfX6WaUgcQWiuWO0AzJQXuPN_NCXxFxj_K8yHjH7eR-L0_6u4nYqfH89e7joi3O0-Ay74p1ZCD6G9RVt11aQ-cjdqYyMemq5yKWgui1rs0NyEgbtroFJEq" },
  { id: 3, name: "Sony WH-1000XM4", price: 35000, qty: 24, category: "Audio", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8C1e5MlHyy8yMM5HO-7RtLieyFzu0-2ouOM1OTfzrinei6Q3saNRElvQd0hj1Z3QbtN47mH1qn_c3wfuYhY2_BTkEqV4pc9VnmdRHz-Qnb28cW8bfXvUJc1bRlRORDQs1cZeuWnq6I1KzG_bqxpkHNB5VQnxKEgHSO0SaFRdcmYDbvEpA9rT_GLrG6ChSj_MK1rhnRrWB5h3aOcWJNYZ59wQQTQyyBscuXG-E6sISRYNkmnPuSSSgx5RVRek_xg8Zp8ohOEfg2twL" },
  { id: 4, name: "APC 1.5KVA Smart UPS", price: 22500, qty: 2, category: "Power", icon: "battery_charging_full" },
  { id: 5, name: 'LG 43" Smart LED TV', price: 45000, qty: 12, category: "TVs", icon: "tv" },
  { id: 6, name: "Shure SM58 Mic", price: 12500, qty: 15, category: "PA Systems", icon: "mic" },
  { id: 7, name: "Soundcraft EFX8 Mixer", price: 42000, qty: 2, category: "PA Systems", icon: "settings_input_component" },
  { id: 8, name: "HDMI Cable 10M Gold", price: 1800, qty: 45, category: "Accessories", icon: "settings_input_hdmi" },
  { id: 9, name: 'Wall Mount 32-65"', price: 3500, qty: 18, category: "Accessories", icon: "settings_overscan" },
  { id: 10, name: "Logitech MK270 Combo", price: 4200, qty: 30, category: "Accessories", icon: "keyboard" },
  { id: 11, name: "JBL PartyBox 310", price: 68000, qty: 4, category: "Audio", icon: "speaker" },
  { id: 12, name: "Epson L3210 EcoTank", price: 28000, qty: 6, category: "Accessories", icon: "print" },
];

export default function POSPage() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MPESA" | "CREDIT">("CASH");

  const filtered = activeCategory === "All Products"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.id === product.id ? { ...c, cartQty: c.cartQty + 1 } : c
        );
      }
      return [...prev, { ...product, cartQty: 1 }];
    });
  }

  function updateQty(id: number, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, cartQty: c.cartQty + delta } : c))
        .filter((c) => c.cartQty > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  const subtotal = cart.reduce((s, c) => s + c.price * c.cartQty, 0);
  const vat = Math.round(subtotal * 0.16);
  const total = subtotal + vat;

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
            />
          </div>
          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
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

        {/* Product Grid */}
        <div className="product-grid">
          {filtered.map((product) => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white border border-outline-variant/30 rounded shadow-sm overflow-hidden cursor-pointer hover:border-primary transition-colors group"
            >
              <div className="h-32 bg-surface-container relative overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="160px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-secondary-container">
                    <span className="material-symbols-outlined text-[48px] text-outline-variant/40 group-hover:text-primary/20 transition-colors">
                      {product.icon}
                    </span>
                  </div>
                )}
                <div
                  className={`absolute top-2 right-2 text-white text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    product.qty <= 3 ? "bg-error" : "bg-on-primary-fixed-variant"
                  }`}
                >
                  {product.qty <= 3 ? "Low Stock" : `Qty: ${product.qty}`}
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
      </div>

      {/* Right: Cart */}
      <div className="hidden md:flex flex-col w-[35%] bg-white border-l border-outline-variant/30 shadow-2xl">
        {/* Cart Header */}
        <div className="p-4 border-b border-surface-variant flex justify-between items-center bg-surface-container-low">
          <div>
            <h2 className="font-panel-header text-panel-header">Current Sale</h2>
            <p className="text-label-sm text-secondary">Ticket #202405-182</p>
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
                key={item.id}
                className="bg-surface-bright border border-outline-variant/20 p-3 rounded flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <span className="font-body-semibold text-[13px] text-on-surface flex-1 pr-2">
                    {item.name}
                  </span>
                  <span className="font-body-semibold text-on-surface text-[13px]">
                    {(item.price * item.cartQty).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-surface-container rounded border border-outline-variant/30 hover:bg-error-container hover:text-error transition-colors"
                    >
                      -
                    </button>
                    <span className="w-10 h-6 flex items-center justify-center text-[12px] border border-outline-variant/30 rounded bg-white">
                      {item.cartQty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center bg-surface-container rounded border border-outline-variant/30 hover:bg-primary-container/20 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-label-sm text-secondary">
                    KES {item.price.toLocaleString()} ea
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
            <button className="w-full bg-[#28a745] hover:bg-[#218838] py-4 rounded text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]">
              <span className="material-symbols-outlined">check_circle</span>
              COMPLETE SALE (F10)
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