import StatBanner from "@/components/ui/StatBanner";
import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";

interface GiftCard {
  code: string;
  issuedTo: string;
  balance: string;
  status: "Active" | "Redeemed" | "Expired";
  actions: { icon: string; danger?: boolean }[];
}

const CARDS: GiftCard[] = [
  { code: "GFT-8821-X90", issuedTo: "Michael Anderson", balance: "$500.00", status: "Active", actions: [{ icon: "edit" }, { icon: "block", danger: true }] },
  { code: "GFT-1120-L42", issuedTo: "Sarah Jenkins", balance: "$0.00", status: "Redeemed", actions: [{ icon: "visibility" }, { icon: "delete", danger: true }] },
  { code: "GFT-3094-P11", issuedTo: "David Thompson", balance: "$125.50", status: "Expired", actions: [{ icon: "refresh" }, { icon: "delete", danger: true }] },
  { code: "GFT-4429-W22", issuedTo: "Linda Richards", balance: "$75.00", status: "Active", actions: [{ icon: "edit" }, { icon: "block", danger: true }] },
];

const STATUS_STYLE: Record<GiftCard["status"], string> = {
  Active: "bg-green-100 text-green-800",
  Redeemed: "bg-secondary-container text-on-secondary-container",
  Expired: "bg-error-container text-on-error-container",
};

export default function GiftCardsPage() {
  const columns: Column<GiftCard>[] = [
    { header: "Card Code", render: (c) => <span className="font-mono font-bold text-primary">{c.code}</span> },
    { header: "Issued To", render: (c) => c.issuedTo },
    { header: "Balance", render: (c) => c.balance },
    {
      header: "Status",
      render: (c) => (
        <span className={`px-2 py-0.5 rounded-full ${STATUS_STYLE[c.status]} text-[11px] font-bold uppercase tracking-tighter`}>
          {c.status}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-2">
          {c.actions.map((a, i) => (
            <button key={i} className={`p-1 text-secondary ${a.danger ? "hover:text-error" : "hover:text-primary"}`}>
              <span className="material-symbols-outlined text-[18px]">{a.icon}</span>
            </button>
          ))}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
        <StatBanner value="1,284" label="Active Cards" icon="credit_card" bgColor="bg-[#3498db]" footerText="More Info" />
        <StatBanner value="$45,200.00" label="Total Value Issued" icon="payments" bgColor="bg-[#2ecc71]" footerText="Detailed Report" />
        <StatBanner value="$12,840.50" label="Redeemed Value" icon="shopping_bag" bgColor="bg-[#f39c12]" footerText="Redemption History" />
      </div>

      <PanelCard title="Gift Card Inventory" icon="list">
        <DataTable columns={columns} rows={CARDS} rowKey={(c) => c.code} />
        <div className="p-4 bg-[#F4F4F4] border-t border-[#EEEEEE] flex justify-between items-center">
          <span className="text-label-sm font-label-sm text-secondary">Showing 4 of 244 entries</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 bg-white border border-[#DDD] text-label-sm hover:bg-surface-container">Previous</button>
            <button className="px-3 py-1 bg-primary text-on-primary text-label-sm">1</button>
            <button className="px-3 py-1 bg-white border border-[#DDD] text-label-sm hover:bg-surface-container">2</button>
            <button className="px-3 py-1 bg-white border border-[#DDD] text-label-sm hover:bg-surface-container">3</button>
            <button className="px-2 py-1 bg-white border border-[#DDD] text-label-sm hover:bg-surface-container">Next</button>
          </div>
        </div>
      </PanelCard>
    </div>
  );
}