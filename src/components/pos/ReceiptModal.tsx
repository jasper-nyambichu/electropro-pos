'use client';

import { useRef } from 'react';
import type { SaleResponse } from '@/lib/api';

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface ReceiptModalProps {
  open: boolean;
  sale: SaleResponse | null;
  items: CartItem[];
  onClose: () => void;
  onNewSale: () => void;
}

const VAT_RATE = 0.16;

export default function ReceiptModal({
  open,
  sale,
  items,
  onClose,
  onNewSale,
}: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!open || !sale) return null;

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  function handlePrint() {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Receipt — ${sale?.receiptNumber}</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 20px; }
        .divider { border-top: 1px dashed #ccc; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin: 4px 0; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .total { font-size: 16px; font-weight: bold; }
      </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
    win.close();
  }

  const fmt = (n: number) =>
    `KES ${n.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-1 text-sm"
        >
          <span className="material-symbols-outlined">close</span>
          Close
        </button>

        {/* Receipt card */}
        <div
          className="bg-white rounded-t-lg shadow-2xl"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), 95% 100%, 90% calc(100% - 10px), 85% 100%, 80% calc(100% - 10px), 75% 100%, 70% calc(100% - 10px), 65% 100%, 60% calc(100% - 10px), 55% 100%, 50% calc(100% - 10px), 45% 100%, 40% calc(100% - 10px), 35% 100%, 30% calc(100% - 10px), 25% 100%, 20% calc(100% - 10px), 15% 100%, 10% calc(100% - 10px), 5% 100%, 0 calc(100% - 10px))' }}
        >
          {/* Print-friendly content */}
          <div ref={printRef} className="p-8">
            {/* Header */}
            <div className="text-center mb-6 pb-6 border-b border-dashed border-gray-200">
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 bg-primary rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-3xl">bolt</span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-on-background uppercase tracking-tight">Sales Receipt</h2>
              <p className="text-primary font-semibold mt-1 text-sm">{sale.receiptNumber}</p>
              <div className="flex justify-center items-center gap-2 mt-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-xs">calendar_today</span>
                <span>{new Date(sale.saleDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>·</span>
                <span className="material-symbols-outlined text-xs">schedule</span>
                <span>{new Date(sale.saleDate).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Customer */}
            <div className="mb-4">
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Customer</p>
              <p className="font-semibold text-sm text-on-surface">
                {sale.customerName || 'Walk-in Customer'}
              </p>
            </div>

            {/* Items */}
            <div className="border-y border-dashed border-gray-200 py-4 mb-4 max-h-48 overflow-y-auto">
              <div className="flex text-xs text-on-surface-variant uppercase mb-2 pb-1 border-b border-gray-100">
                <span className="flex-1">Item</span>
                <span className="w-10 text-center">Qty</span>
                <span className="w-24 text-right">Price</span>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="flex items-start py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-on-surface truncate">{item.productName}</p>
                    <p className="text-xs text-on-surface-variant">{fmt(item.unitPrice)} each</p>
                  </div>
                  <span className="w-10 text-center text-xs text-on-surface">{item.quantity}</span>
                  <span className="w-24 text-right text-xs font-semibold text-on-surface">{fmt(item.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>VAT (16%)</span>
                <span>{fmt(vat)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-dashed border-gray-200">
                <span className="text-base font-bold text-on-background uppercase">Total</span>
                <span className="text-xl font-bold text-primary">{fmt(total)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">
                  {sale.paymentMethod === 'MPESA' ? 'smartphone' : sale.paymentMethod === 'CARD' ? 'credit_card' : 'payments'}
                </span>
                <span className="text-sm font-semibold text-on-surface">{sale.paymentMethod}</span>
              </div>
              <span className="text-xs font-bold text-green-600 uppercase">Paid</span>
            </div>

            {/* Footer */}
            <p className="text-center text-xs italic text-on-surface-variant">
              "Thank you for your purchase!"
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 border-2 border-white text-white hover:bg-white hover:text-on-background transition-all py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">print</span>
            Print Receipt
          </button>
          <button
            onClick={onNewSale}
            className="flex-1 bg-green-600 text-white hover:bg-green-700 transition-all py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined text-base">add_shopping_cart</span>
            New Sale
          </button>
        </div>
      </div>
    </div>
  );
}