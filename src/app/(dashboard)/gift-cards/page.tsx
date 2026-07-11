// src/app/(dashboard)/gift-cards/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import StatBanner from "@/components/ui/StatBanner";
import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";
import { giftCardsApi, ApiError, GiftCardResponseDto } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  REDEEMED: "bg-secondary-container text-on-secondary-container",
  EXPIRED: "bg-error-container text-on-error-container",
};

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function GiftCardsPage() {
  const toast = useToast();
  const [cards, setCards] = useState<GiftCardResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setCards(await giftCardsApi.list());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load gift cards.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeCount = cards.filter((c) => c.status?.toUpperCase() === "ACTIVE").length;
  const totalIssued = cards.reduce((sum, c) => sum + c.initialValue, 0);
  const totalRedeemed = cards.reduce((sum, c) => sum + (c.initialValue - c.currentBalance), 0);

  async function handleRedeem(c: GiftCardResponseDto) {
    if (c.status?.toUpperCase() !== "ACTIVE") return;
    if (!confirm(`Redeem gift card ${c.code}? This will draw down its balance.`)) return;
    try {
      await giftCardsApi.redeem(c.code);
      toast.success(`Gift card ${c.code} redeemed.`);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not redeem gift card.");
    }
  }

  const columns: Column<GiftCardResponseDto>[] = [
    { header: "Card Code", render: (c) => <span className="font-mono font-bold text-primary">{c.code}</span> },
    { header: "Initial Value", render: (c) => `KES ${c.initialValue.toLocaleString()}` },
    { header: "Balance", render: (c) => `KES ${c.currentBalance.toLocaleString()}` },
    { header: "Expiry Date", render: (c) => new Date(c.expiryDate).toLocaleDateString() },
    {
      header: "Status",
      render: (c) => (
        <span className={`px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status?.toUpperCase() ?? ""] ?? "bg-gray-100 text-gray-700"} text-[11px] font-bold uppercase tracking-tighter`}>
          {statusLabel(c.status ?? "Unknown")}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleRedeem(c)}
            disabled={c.status?.toUpperCase() !== "ACTIVE"}
            className={`p-1 transition-colors ${
              c.status?.toUpperCase() === "ACTIVE" ? "text-secondary hover:text-primary" : "text-secondary opacity-30 cursor-default"
            }`}
            title={c.status?.toUpperCase() === "ACTIVE" ? "Redeem" : "Not redeemable"}
          >
            <span className="material-symbols-outlined text-[18px]">redeem</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-page-title font-page-title text-on-background">Gift Cards</h1>
          <p className="text-secondary text-label-sm font-label-sm">
            Manage store credit and customer loyalty cards
          </p>
        </div>
        <button className="bg-primary text-on-primary px-4 py-2 rounded shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 text-body-semibold font-body-semibold">
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Issue Gift Card
        </button>
      </div>

      {error && (
        <div className="bg-error-container/20 border border-error text-error rounded p-3 text-label-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
        <StatBanner value={`${activeCount}`} label="Active Cards" icon="credit_card" bgColor="bg-[#3498db]" footerText="" />
        <StatBanner value={`KES ${totalIssued.toLocaleString()}`} label="Total Value Issued" icon="payments" bgColor="bg-[#2ecc71]" footerText="" />
        <StatBanner value={`KES ${totalRedeemed.toLocaleString()}`} label="Redeemed Value" icon="shopping_bag" bgColor="bg-[#f39c12]" footerText="" />
      </div>

      <PanelCard title="Gift Card Inventory" icon="list">
        {loading ? (
          <p className="p-6 text-center text-secondary">Loading gift cards…</p>
        ) : cards.length === 0 ? (
          <p className="p-6 text-center text-secondary">No gift cards issued yet.</p>
        ) : (
          <>
            <DataTable columns={columns} rows={cards} rowKey={(c) => c.code} />
            <div className="p-4 bg-[#F4F4F4] border-t border-[#EEEEEE] flex justify-between items-center">
              <span className="text-label-sm font-label-sm text-secondary">
                Showing {cards.length} of {cards.length} entries
              </span>
            </div>
          </>
        )}
      </PanelCard>
    </div>
  );
}