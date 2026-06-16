import Link from "next/link";
import SalesChart from "@/components/charts/SalesChart";

interface Tile {
  value: string | number;
  label: string;
  icon: string;
  bg: string;
  href: string;
}

const TILES: Tile[] = [
  { value: 3, label: "POS Terminals", icon: "monitor", bg: "#E74C3C", href: "/pos" },
  { value: 47, label: "Products", icon: "barcode_scanner", bg: "#E67E22", href: "/products" },
  { value: 524, label: "Total Sales", icon: "shopping_cart", bg: "#F1C40F", href: "/sales" },
  { value: 8, label: "Open Invoices", icon: "notifications_active", bg: "#27AE60", href: "/sales" },
  { value: 6, label: "Categories", icon: "sell", bg: "#2980B9", href: "/categories" },
  { value: 3, label: "Quotations", icon: "description", bg: "#8E44AD", href: "/sales/quotations" },
  { value: 38, label: "Customers", icon: "group", bg: "#E67E22", href: "/customers" },
  { value: "·", label: "Settings", icon: "settings", bg: "#E74C3C", href: "/settings" },
  { value: "·", label: "Reports", icon: "analytics", bg: "#95A5A6", href: "/reports/daily" },
  { value: 4, label: "Staff Users", icon: "person", bg: "#3498DB", href: "/settings" },
  { value: "·", label: "Data Backup", icon: "database", bg: "#2C3E50", href: "/settings" },
  { value: 1, label: "Branch", icon: "storefront", bg: "#27AE60", href: "/settings" },
];

const TOP_PRODUCTS = [
  { name: 'Samsung 55" UHD', value: "KES 156,000", pct: 85 },
  { name: "Yamaha DBR12 Active", value: "KES 110,000", pct: 70 },
  { name: "Behringer Mixer 1204", value: "KES 64,000", pct: 55 },
  { name: "Sony WH-1000XM5", value: "KES 58,000", pct: 45 },
  { name: "Crown PA Speaker", value: "KES 42,500", pct: 30 },
];

export default function DashboardPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">Dashboard</h1>
          <nav className="flex text-label-sm font-label-sm text-on-surface-variant gap-2 mt-1 items-center">
            <span className="material-symbols-outlined text-[14px] text-primary">home</span>
            <span>Home</span>
            <span>/</span>
            <span>Dashboard</span>
          </nav>
        </div>
      </div>

      {/* Quick Links Panel */}
      <div className="bg-white border border-surface-container shadow-sm mb-6">
        <div className="px-gutter py-2 border-b border-surface-container font-panel-header text-panel-header flex items-center">
          <span className="material-symbols-outlined mr-2 text-[18px]">link</span>
          Quick Links
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {TILES.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="relative h-[120px] text-white p-4 rounded-sm overflow-hidden shadow-sm hover:brightness-95 transition-all cursor-pointer dashboard-tile block"
              style={{ backgroundColor: tile.bg }}
            >
              <div className="font-tile-number text-tile-number leading-none">{tile.value}</div>
              <div className="font-body-reg text-body-reg mt-1">{tile.label}</div>
              <span className="material-symbols-outlined absolute right-2 top-2 text-[60px] opacity-20 pointer-events-none">
                {tile.icon}
              </span>
              <div className="absolute bottom-0 left-0 w-full h-6 bg-black/10 flex items-center justify-center font-label-sm text-[10px] text-white/80">
                More Info{" "}
                <span className="material-symbols-outlined text-[12px] ml-1">arrow_circle_right</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-20">
        {/* Sales Chart */}
        <div className="lg:col-span-6 bg-white border border-surface-container shadow-sm">
          <div className="px-gutter py-2 border-b border-surface-container font-panel-header text-panel-header flex items-center justify-between">
            <div className="flex items-center">
              <span className="material-symbols-outlined mr-2 text-[18px]">show_chart</span>
              Sales Graph (KES thousands)
            </div>
            <div className="flex gap-4 text-[10px] font-label-sm uppercase">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#2980B9] inline-block"></span> VAT
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#2C3E50] inline-block"></span> Discounts
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#27AE60] inline-block"></span> Revenue
              </span>
            </div>
          </div>
          <div className="p-5" style={{ height: "330px" }}>
            <SalesChart />
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-4 bg-white border border-surface-container shadow-sm">
          <div className="px-gutter py-2 border-b border-surface-container font-panel-header text-panel-header flex items-center">
            <span className="material-symbols-outlined mr-2 text-[18px]">inventory</span>
            Top Products (December 2024)
          </div>
          <div className="p-5 flex flex-col gap-6">
            {TOP_PRODUCTS.map((p) => (
              <div key={p.name}>
                <div className="flex justify-between font-body-semibold text-body-semibold mb-1">
                  <span>{p.name}</span>
                  <span className="text-primary">{p.value}</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full">
                  <div
                    className="bg-[#27AE60] h-full rounded-full"
                    style={{ width: `${p.pct}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}