import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";

interface StockItem {
  product: string;
  brand: string;
  category: string;
  stock: number;
  unitCost: string;
  totalValue: string;
  critical?: boolean;
  outOfStock?: boolean;
}

const STOCK: StockItem[] = [
  { product: "iPhone 15 Pro Max", brand: "Apple", category: "Smartphones", stock: 24, unitCost: "155,000", totalValue: "3,720,000" },
  { product: "MacBook Air M2", brand: "Apple", category: "Laptops", stock: 12, unitCost: "185,000", totalValue: "2,220,000" },
  { product: "Sony WH-1000XM5", brand: "Sony", category: "Accessories", stock: 3, unitCost: "45,000", totalValue: "135,000", critical: true },
  { product: "Samsung S24 Ultra", brand: "Samsung", category: "Smartphones", stock: 18, unitCost: "145,000", totalValue: "2,610,000" },
  { product: "Logitech MX Master 3S", brand: "Logitech", category: "Accessories", stock: 0, unitCost: "12,500", totalValue: "0", outOfStock: true },
  { product: "Dell XPS 15", brand: "Dell", category: "Laptops", stock: 5, unitCost: "210,000", totalValue: "1,050,000" },
];

const CATEGORY_VALUES = [
  { label: "Smartphones", value: "KES 1.8M", color: "bg-primary" },
  { label: "Laptops", value: "KES 1.2M", color: "bg-secondary" },
  { label: "Accessories", value: "KES 800K", color: "bg-[#00c0ef]" },
  { label: "Other", value: "KES 400K", color: "bg-[#f39c12]" },
];

export default function StockReportPage() {
  const columns: Column<StockItem>[] = [
    {
      header: "Product",
      render: (s) => (
        <span className={`font-body-semibold ${s.outOfStock ? "text-error" : ""}`}>{s.product}</span>
      ),
    },
    { header: "Brand", render: (s) => s.brand },
    { header: "Category", render: (s) => s.category },
    {
      header: "Current Stock",
      align: "right",
      render: (s) =>
        s.critical || s.outOfStock ? (
          <span className="text-error font-bold">{s.stock}</span>
        ) : (
          s.stock
        ),
    },
    { header: "Unit Cost", align: "right", render: (s) => s.unitCost },
    { header: "Total Value", align: "right", render: (s) => <span className="font-body-semibold">{s.totalValue}</span> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">Stock Report</h1>
          <p className="text-secondary font-body-reg">Detailed inventory analytics and stock health status.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-surface text-secondary border border-outline-variant px-3 py-1.5 rounded-sm font-body-semibold text-[13px] flex items-center gap-1 hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span> Export PDF
          </button>
          <button className="bg-primary text-on-primary px-3 py-1.5 rounded-sm font-body-semibold text-[13px] flex items-center gap-1 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">print</span> Print Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[15px]">
        <div className="bg-[#00c0ef] text-white rounded-sm overflow-hidden relative shadow-sm h-32 flex flex-col justify-between">
          <div className="p-4 relative z-10">
            <h3 className="font-tile-number text-tile-number">1,248</h3>
            <p className="font-body-reg opacity-90">Total Products</p>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-2 text-[60px] opacity-20 select-none">inventory_2</span>
          <div className="small-box-footer py-1 px-3 text-center text-[12px] cursor-pointer hover:bg-black/20">
            More info <span className="material-symbols-outlined text-[12px] align-middle">arrow_circle_right</span>
          </div>
        </div>
        <div className="bg-[#00a65a] text-white rounded-sm overflow-hidden relative shadow-sm h-32 flex flex-col justify-between">
          <div className="p-4 relative z-10">
            <h3 className="font-tile-number text-tile-number">KES 4.2M</h3>
            <p className="font-body-reg opacity-90">Stock Value</p>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-2 text-[60px] opacity-20 select-none">payments</span>
          <div className="small-box-footer py-1 px-3 text-center text-[12px] cursor-pointer hover:bg-black/20">
            More info <span className="material-symbols-outlined text-[12px] align-middle">arrow_circle_right</span>
          </div>
        </div>
        <div className="bg-[#f39c12] text-white rounded-sm overflow-hidden relative shadow-sm h-32 flex flex-col justify-between">
          <div className="p-4 relative z-10">
            <h3 className="font-tile-number text-tile-number">42</h3>
            <p className="font-body-reg opacity-90">Low Stock</p>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-2 text-[60px] opacity-20 select-none">warning</span>
          <div className="small-box-footer py-1 px-3 text-center text-[12px] cursor-pointer hover:bg-black/20">
            More info <span className="material-symbols-outlined text-[12px] align-middle">arrow_circle_right</span>
          </div>
        </div>
        <div className="bg-[#dd4b39] text-white rounded-sm overflow-hidden relative shadow-sm h-32 flex flex-col justify-between">
          <div className="p-4 relative z-10">
            <h3 className="font-tile-number text-tile-number">18</h3>
            <p className="font-body-reg opacity-90">Out of Stock</p>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-2 text-[60px] opacity-20 select-none">error</span>
          <div className="small-box-footer py-1 px-3 text-center text-[12px] cursor-pointer hover:bg-black/20">
            More info <span className="material-symbols-outlined text-[12px] align-middle">arrow_circle_right</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[15px]">
        <div className="lg:col-span-4">
          <PanelCard title="Stock Value by Category" icon="pie_chart">
            <div className="p-5 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 mb-6">
                <div
                  className="w-full h-full rounded-full border-[25px]"
                  style={{ borderColor: "#b32200 #4e6073 #00c0ef #f39c12" }}
                ></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-label-sm text-secondary">Total Value</span>
                  <span className="font-body-semibold text-on-surface">4.2M</span>
                </div>
              </div>
              <div className="w-full space-y-2">
                {CATEGORY_VALUES.map((c) => (
                  <div key={c.label} className="flex justify-between items-center text-label-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 ${c.color} rounded-full`}></span>
                      <span>{c.label}</span>
                    </div>
                    <span className="font-body-semibold">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </PanelCard>
        </div>

        <div className="lg:col-span-8">
          <PanelCard
            title="Inventory Status"
            icon="list_alt"
            headerExtra={
              <input
                className="border border-outline-variant text-[12px] px-2 py-1 rounded-sm w-40 focus:ring-1 focus:ring-primary"
                placeholder="Filter products..."
                type="text"
              />
            }
          >
            <DataTable columns={columns} rows={STOCK} rowKey={(s) => s.product} />
            <div className="px-4 py-3 bg-[#F4F4F4] border-t border-[#EEEEEE] flex justify-between items-center text-label-sm">
              <span>Showing 1 to 6 of 1,248 entries</span>
              <div className="flex gap-1">
                <button className="px-2 py-1 border border-outline-variant bg-white hover:bg-surface-variant rounded-sm">Previous</button>
                <button className="px-2 py-1 border border-primary bg-primary text-on-primary rounded-sm">1</button>
                <button className="px-2 py-1 border border-outline-variant bg-white hover:bg-surface-variant rounded-sm">2</button>
                <button className="px-2 py-1 border border-outline-variant bg-white hover:bg-surface-variant rounded-sm">Next</button>
              </div>
            </div>
          </PanelCard>
        </div>
      </div>
    </div>
  );
}