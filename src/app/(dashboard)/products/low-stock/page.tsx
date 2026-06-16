import Image from "next/image";
import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";
import Pagination from "@/components/ui/Pagination";

interface LowStockItem {
  name: string;
  imageSrc?: string;
  sku: string;
  category: string;
  stock: number;
  threshold: number;
  status: "Critical" | "Low Stock" | "Out of Stock";
}

const LOW_STOCK_ITEMS: LowStockItem[] = [
  { name: 'Sony 65" 4K Smart TV', imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6vJMVqEP8FTWeUD7fTuG3_CFFAS8bEJdhre9nmH5qZANJ1bg2JL51Pr3a4-f3Z3rF4Mqd3r9KAD2x8spimTg5OVWrXQZbcoZZQ97GLGeifTyymwHGVfwZ5KKOdJtm9qfTpsAR9uBeT3Yb--o_R1YGurB1IyNzYlbWdYgb_nctrPZ2OrvwXcTXdztDD8_0ApAkZJM8S3KTxeLLL9QuJAOITHe2YCyvKBBsgvX0cDvVm2s5EEFeu9o09heozvolXvGDxztJfN847qYV", sku: "TV-SONY-65A1", category: "TVs", stock: 2, threshold: 10, status: "Critical" },
  { name: "Crown PA Amplifier 1000W", imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuBeiPKTo2hNO9mGo35B50yMHjDExgu047BYUUCFt3Nqpq4YfIGnAH7I5ZDSTFxjkAFM8pxw", sku: "AMP-CR-PA1K", category: "PA Systems", stock: 0, threshold: 5, status: "Out of Stock" },
  { name: "Yamaha DBR12 Speaker", sku: "YAM-DBR12", category: "PA Systems", stock: 2, threshold: 5, status: "Critical" },
  { name: "Behringer X1622 Mixer", sku: "BEH-X1622", category: "PA Systems", stock: 3, threshold: 8, status: "Low Stock" },
  { name: "APC 1KVA UPS", sku: "APC-1KVA", category: "Power", stock: 4, threshold: 10, status: "Low Stock" },
  { name: "Samsung 55\" CU7000", sku: "SAM-55CU7", category: "TVs", stock: 4, threshold: 10, status: "Low Stock" },
  { name: "Shure BLX24 Wireless Mic", sku: "SHR-BLX24", category: "PA Systems", stock: 5, threshold: 8, status: "Low Stock" },
];

const STATUS_STYLES: Record<LowStockItem["status"], { badge: string; stock: string }> = {
  Critical: {
    badge: "bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
    stock: "text-[#E8401C] font-bold",
  },
  "Low Stock": {
    badge: "bg-[#FFF4E5] text-[#663C00] border border-[#FFD599] px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
    stock: "text-[#B72300] font-bold",
  },
  "Out of Stock": {
    badge: "bg-black text-white px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
    stock: "text-[#ba1a1a] font-bold",
  },
};

export default function LowStockPage() {
  const columns: Column<LowStockItem>[] = [
    {
      header: "Product",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-container flex items-center justify-center rounded overflow-hidden border border-outline-variant/10 flex-shrink-0 relative">
            {item.imageSrc ? (
              <Image src={item.imageSrc} alt={item.name} fill sizes="40px" className="object-cover rounded" />
            ) : (
              <span className="material-symbols-outlined text-secondary text-[20px]">inventory_2</span>
            )}
          </div>
          <span className="font-body-semibold">{item.name}</span>
        </div>
      ),
    },
    {
      header: "SKU",
      render: (item) => (
        <span className="font-mono text-[12px] text-secondary">{item.sku}</span>
      ),
    },
    { header: "Category", render: (item) => <span className="text-secondary">{item.category}</span> },
    {
      header: "Stock",
      align: "center",
      render: (item) => (
        <span className={STATUS_STYLES[item.status].stock}>{item.stock}</span>
      ),
    },
    { header: "Threshold", align: "center", render: (item) => <span className="text-secondary">{item.threshold}</span> },
    {
      header: "Status",
      render: (item) => (
        <span className={STATUS_STYLES[item.status].badge}>{item.status}</span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (item) => (
        <button
          className={`text-xs font-bold py-1.5 px-3 rounded hover:opacity-90 transition-opacity text-white ${
            item.status === "Out of Stock" ? "bg-primary" : "bg-secondary"
          }`}
        >
          {item.status === "Out of Stock" ? "Reorder Now" : "Reorder"}
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Alert banner */}
      <div className="amber-alert p-4 rounded flex items-center shadow-sm">
        <span className="material-symbols-outlined mr-3 text-[24px]">warning</span>
        <div className="flex-1">
          <h3 className="font-bold text-sm">Critical Inventory Alert</h3>
          <p className="text-[13px]">
            There are 7 items currently below their reorder threshold. Immediate action recommended to avoid stockouts.
          </p>
        </div>
        <button className="bg-white/50 hover:bg-white text-xs px-3 py-1.5 rounded font-bold uppercase tracking-wide border border-black/10 transition-colors">
          Generate PO All
        </button>
      </div>

      {/* Page header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Low Stock Alerts</h1>
          <p className="text-secondary font-body-reg">Detailed view of products requiring replenishment</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-outline-variant/30 px-4 py-2 text-secondary font-body-semibold flex items-center shadow-sm hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px] mr-2">download</span> Export CSV
          </button>
          <button className="bg-primary text-on-primary px-4 py-2 font-body-semibold flex items-center shadow-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px] mr-2">add_shopping_cart</span> Bulk Reorder
          </button>
        </div>
      </div>

      {/* Table */}
      <PanelCard title="Active Alerts Table" icon="inventory">
        <DataTable columns={columns} rows={LOW_STOCK_ITEMS} rowKey={(i) => i.sku} />
        <Pagination showingFrom={1} showingTo={7} total={7} currentPage={1} totalPages={1} />
      </PanelCard>

      {/* Bento summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
        <div className="bg-white border border-[#EEEEEE] p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error flex-shrink-0">
            <span className="material-symbols-outlined text-[28px]">trending_down</span>
          </div>
          <div>
            <p className="text-secondary text-xs uppercase font-bold tracking-tight">Total Deficit</p>
            <p className="text-2xl font-bold">-KES 182k</p>
            <p className="text-[11px] text-error font-bold">Estimated sales loss risk</p>
          </div>
        </div>
        <div className="bg-white border border-[#EEEEEE] p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary flex-shrink-0">
            <span className="material-symbols-outlined text-[28px]">local_shipping</span>
          </div>
          <div>
            <p className="text-secondary text-xs uppercase font-bold tracking-tight">Pending Orders</p>
            <p className="text-2xl font-bold">4</p>
            <p className="text-[11px] text-on-secondary-container font-bold">Incoming stock shipments</p>
          </div>
        </div>
        <div className="bg-white border border-[#EEEEEE] p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FFF4E5] flex items-center justify-center text-[#663C00] flex-shrink-0">
            <span className="material-symbols-outlined text-[28px]">calendar_today</span>
          </div>
          <div>
            <p className="text-secondary text-xs uppercase font-bold tracking-tight">Avg. Restock Time</p>
            <p className="text-2xl font-bold">3.2 Days</p>
            <p className="text-[11px] text-[#663C00] font-bold">+0.5 from last month</p>
          </div>
        </div>
      </div>
    </div>
  );
}