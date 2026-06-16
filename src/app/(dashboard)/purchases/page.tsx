import Image from "next/image";
import StatBanner from "@/components/ui/StatBanner";
import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";
import Badge from "@/components/ui/Badge";

interface PurchaseOrder {
  poNumber: string;
  supplier: string;
  supplierInitial: string;
  supplierBg: string;
  supplierText: string;
  items: string;
  totalCost: string;
  status: "Received" | "Ordered" | "Partial";
  actions: string[];
}

const ORDERS: PurchaseOrder[] = [
  { poNumber: "PO-2024-001", supplier: "Samsung Electronics", supplierInitial: "S", supplierBg: "bg-blue-100", supplierText: "text-blue-700", items: "12x Galaxy S24 Ultra, 5x Tabs", totalCost: "1,450,000", status: "Received", actions: ["visibility", "print", "more_vert"] },
  { poNumber: "PO-2024-002", supplier: "Yamaha Music Shop", supplierInitial: "Y", supplierBg: "bg-red-100", supplierText: "text-red-700", items: "2x Digital Pianos, 10x Monitors", totalCost: "825,000", status: "Ordered", actions: ["visibility", "edit", "more_vert"] },
  { poNumber: "PO-2024-003", supplier: "Apple Global Distribution", supplierInitial: "A", supplierBg: "bg-purple-100", supplierText: "text-purple-700", items: "20x iPhone 15 Pro Max", totalCost: "3,200,000", status: "Partial", actions: ["visibility", "inventory_2", "more_vert"] },
  { poNumber: "PO-2024-004", supplier: "Logitech Solutions", supplierInitial: "L", supplierBg: "bg-yellow-100", supplierText: "text-yellow-700", items: "50x MX Master 3S", totalCost: "450,000", status: "Received", actions: ["visibility", "print", "more_vert"] },
  { poNumber: "PO-2024-005", supplier: "Dell Technologies", supplierInitial: "D", supplierBg: "bg-gray-200", supplierText: "text-gray-700", items: "5x XPS 15 Laptops", totalCost: "1,125,000", status: "Ordered", actions: ["visibility", "edit", "more_vert"] },
];

const STATUS_BADGE: Record<PurchaseOrder["status"], "green" | "amber" | "blue"> = {
  Received: "green",
  Ordered: "amber",
  Partial: "blue",
};

const STATUS_BORDER: Record<PurchaseOrder["status"], string> = {
  Received: "border-green-200",
  Ordered: "border-orange-200",
  Partial: "border-blue-200",
};

const SUPPLIERS = [
  { name: "Samsung Service", email: "supply@samsung.com", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCP3BtW2SMSVJpMcZYXLDeSuQpjNGa8cJz67UDZrGLX2LRcaqdSR_M8lPVG5MjeVY5g3apZEkjG7ZQ_JRQCyk_srf_VB1OkbEn17RdIEQtKWjFq5xC4a3-KDkTfmFA1kn0hPw2fXiIm38OC-bUe0jNgqzk82QxbyuKiEzOQ9SCxcFEMW8B9A3zleGPAK1SNVwfMSGdI0HdSuuFZingl_j7GDAo3vkHK7zW3CXWxyoDX-orJZdqdBQo8nAPgy9-u7P2rFh8XXWcJ-ICN" },
  { name: "Yamaha Music", email: "orders@yamaha.co.jp", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCeuqWsAynkNKErZEsd-yt0kmFmSA9o7sSW4jyQTX36pNVX7iNcXyjzdIVA1u78rqmkVZPODztoD9xjui-GxKbQLhRpct6Y092vym-Ry8is_9ovGQC13fYT4F1sS18wyU72c18eE9zQ6NmD__DwG70G4s6bgrsDTe2gLQL06p4zzZJWpGbqhlI5BUOvCBLyRM7gdqTlkqCh4CckCKJrHD4MvQXgdlEHsKkuZ2T2ApyIEjjHooJWYtlNY4yoekP69AzPFMpJpNhz9gy2" },
];

export default function PurchasesPage() {
  const columns: Column<PurchaseOrder>[] = [
    { header: "PO Number", render: (o) => <span className="font-body-semibold">{o.poNumber}</span> },
    {
      header: "Supplier",
      render: (o) => (
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full ${o.supplierBg} flex items-center justify-center text-[10px] ${o.supplierText} font-bold`}>
            {o.supplierInitial}
          </div>
          {o.supplier}
        </div>
      ),
    },
    { header: "Items", render: (o) => o.items },
    { header: "Total Cost (KES)", render: (o) => <span className="font-mono">{o.totalCost}</span> },
    {
      header: "Status",
      align: "center",
      render: (o) => (
        <span
          className={`${
            STATUS_BADGE[o.status] === "green"
              ? "bg-green-100 text-green-700"
              : STATUS_BADGE[o.status] === "amber"
              ? "bg-orange-100 text-orange-700"
              : "bg-blue-100 text-blue-700"
          } text-[11px] font-bold px-2 py-0.5 rounded uppercase border ${STATUS_BORDER[o.status]}`}
        >
          {o.status}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (o) => (
        <div className="flex justify-end gap-2">
          {o.actions.map((icon) => (
            <button key={icon} className="text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Purchase Orders</h1>
          <p className="text-label-sm text-secondary font-label-sm">
            Manage inventory procurement and supplier interactions.
          </p>
        </div>
        <button className="bg-primary text-on-primary flex items-center gap-2 px-4 py-2 rounded shadow-sm hover:opacity-90 transition-opacity font-body-semibold">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New PO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-[15px]">
        <StatBanner value="148" label="Total Orders" icon="shopping_basket" bgColor="bg-blue-600" footerText="View all" />
        <StatBanner value="12" label="Pending" icon="pending_actions" bgColor="bg-orange-500" footerText="Needs attention" />
        <StatBanner value="124" label="Received" icon="verified" bgColor="bg-green-600" footerText="In stock" />
        <StatBanner value="2" label="Overdue" icon="emergency_home" bgColor="bg-red-600" footerText="Contact suppliers" />
      </div>

      <PanelCard
        title="Purchase Order List"
        icon="list_alt"
        headerExtra={
          <div className="flex gap-2">
            <button className="bg-white border border-outline-variant/30 text-secondary text-label-sm px-3 py-1 rounded flex items-center gap-1 hover:bg-surface transition-colors">
              <span className="material-symbols-outlined text-[16px]">filter_list</span> Filter
            </button>
            <button className="bg-white border border-outline-variant/30 text-secondary text-label-sm px-3 py-1 rounded flex items-center gap-1 hover:bg-surface transition-colors">
              <span className="material-symbols-outlined text-[16px]">download</span> Export
            </button>
          </div>
        }
      >
        <DataTable columns={columns} rows={ORDERS} rowKey={(o) => o.poNumber} />
        <div className="px-[15px] py-[10px] bg-[#F4F4F4] border-t border-[#EEEEEE] flex justify-between items-center">
          <span className="text-label-sm font-label-sm text-secondary">Showing 5 of 148 entries</span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-outline-variant/20 rounded hover:bg-surface">
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded font-bold text-label-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-outline-variant/20 rounded hover:bg-surface text-label-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-outline-variant/20 rounded hover:bg-surface text-label-sm">3</button>
            <button className="w-8 h-8 flex items-center justify-center bg-white border border-outline-variant/20 rounded hover:bg-surface">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </PanelCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
        <div className="bg-white p-[15px] border border-[#EEEEEE] rounded md:col-span-2">
          <h3 className="font-panel-header text-panel-header mb-3 uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Recent Expenditure Trend
          </h3>
          <div className="h-48 w-full bg-surface-container relative rounded overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 400 100">
              <path d="M0 80 Q 50 70, 100 85 T 200 40 T 300 60 T 400 20" fill="none" stroke="#b32200" strokeWidth="2" />
              <path d="M0 80 Q 50 70, 100 85 T 200 40 T 300 60 T 400 20 V 100 H 0 Z" fill="rgba(179, 34, 0, 0.05)" />
            </svg>
            <div className="absolute inset-0 flex justify-between items-end px-4 pb-2 text-[10px] text-secondary/60">
              <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-[15px] border border-[#EEEEEE] rounded">
          <h3 className="font-panel-header text-panel-header mb-3 uppercase flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary">quick_reference_all</span>
            Quick Supplier Contact
          </h3>
          <div className="space-y-3">
            {SUPPLIERS.map((s) => (
              <div key={s.name} className="flex items-center justify-between group cursor-pointer hover:bg-surface transition-colors p-1 rounded">
                <div className="flex items-center gap-2">
                  <Image alt={s.name} src={s.img} width={32} height={32} className="rounded object-cover" />
                  <div>
                    <p className="text-body-semibold text-on-surface">{s.name}</p>
                    <p className="text-[11px] text-secondary">{s.email}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                  call
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 border border-dashed border-outline-variant text-secondary text-label-sm rounded hover:bg-surface transition-all">
            + Add New Supplier
          </button>
        </div>
      </div>
    </div>
  );
}