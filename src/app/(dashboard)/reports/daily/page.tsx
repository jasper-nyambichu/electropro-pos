import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";

interface SaleRow {
  invoice: string;
  time: string;
  customer: string;
  items: string;
  total: string;
  payment: "Cash" | "Mpesa" | "Credit";
}

const SALES: SaleRow[] = [
  { invoice: "#INV-98421", time: "14:22 PM", customer: "Walk-in", items: "Samsung Galaxy S23 (x1)", total: "KES 12,500", payment: "Cash" },
  { invoice: "#INV-98420", time: "14:15 PM", customer: "Alice Wanjiku", items: "Wireless Buds (x2), Case (x1)", total: "KES 4,200", payment: "Mpesa" },
  { invoice: "#INV-98419", time: "13:58 PM", customer: "Walk-in", items: "USB-C Cable 2m (x5)", total: "KES 2,500", payment: "Cash" },
  { invoice: "#INV-98418", time: "13:40 PM", customer: "John Doe", items: "Laptop Charger (x1)", total: "KES 3,800", payment: "Credit" },
  { invoice: "#INV-98417", time: "13:10 PM", customer: "Walk-in", items: "Power Bank 20k (x1)", total: "KES 5,400", payment: "Mpesa" },
];

const PAYMENT_DOT: Record<SaleRow["payment"], string> = {
  Cash: "bg-[#28a745]",
  Mpesa: "bg-[#17a2b8]",
  Credit: "bg-[#ffc107]",
};

interface Cashier {
  name: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  orders: number;
  sales: string;
  status: "ACTIVE" | "BREAK" | "OFFLINE";
}

const CASHIERS: Cashier[] = [
  { name: "Brian M", initials: "BM", avatarBg: "bg-secondary-container", avatarText: "text-secondary", orders: 78, sales: "KES 46,120", status: "ACTIVE" },
  { name: "Jane K", initials: "JK", avatarBg: "bg-primary-fixed", avatarText: "text-primary", orders: 64, sales: "KES 38,080", status: "BREAK" },
  { name: "Sam A", initials: "SA", avatarBg: "bg-tertiary-fixed", avatarText: "text-tertiary", orders: 0, sales: "KES 0", status: "OFFLINE" },
];

const CASHIER_STATUS_STYLE: Record<Cashier["status"], string> = {
  ACTIVE: "bg-[#28a745]/10 text-[#28a745]",
  BREAK: "bg-[#ffc107]/10 text-[#856404]",
  OFFLINE: "bg-[#6c757d]/10 text-[#6c757d]",
};

export default function DailyReportPage() {
  const salesColumns: Column<SaleRow>[] = [
    { header: "Invoice #", render: (s) => <span className="font-body-semibold text-primary">{s.invoice}</span> },
    { header: "Time", render: (s) => s.time },
    { header: "Customer", render: (s) => s.customer },
    { header: "Items", render: (s) => s.items },
    { header: "Total Amount", render: (s) => <span className="font-body-semibold">{s.total}</span> },
    {
      header: "Payment",
      render: (s) => (
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${PAYMENT_DOT[s.payment]}`}></span> {s.payment}
        </span>
      ),
    },
    {
      header: "Action",
      align: "right",
      render: () => (
        <button className="p-1 hover:bg-surface-container rounded">
          <span className="material-symbols-outlined text-[18px] text-secondary">visibility</span>
        </button>
      ),
    },
  ];

  const cashierColumns: Column<Cashier>[] = [
    {
      header: "Cashier Name",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${c.avatarBg} flex items-center justify-center ${c.avatarText} font-bold text-xs`}>
            {c.initials}
          </div>
          <span>{c.name}</span>
        </div>
      ),
    },
    { header: "Orders", render: (c) => c.orders },
    { header: "Gross Sales", render: (c) => c.sales },
    {
      header: "Status",
      render: (c) => (
        <span className={`${CASHIER_STATUS_STYLE[c.status]} px-2 py-0.5 rounded-full text-[10px] font-bold`}>
          {c.status}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-[15px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-page-title font-page-title text-on-background">Daily Sales Report</h1>
          <p className="text-secondary text-label-sm">Review operational performance for the current day</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-outline-variant/30 rounded px-2 py-1 shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-secondary mr-2">calendar_today</span>
            <input className="border-none focus:ring-0 p-0 text-body-reg text-on-background bg-transparent" type="date" defaultValue="2024-05-24" />
          </div>
          <button className="bg-primary text-on-primary px-4 py-2 flex items-center gap-2 rounded shadow-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span className="text-body-semibold">Print</span>
          </button>
          <button className="bg-on-secondary-fixed-variant text-on-primary px-4 py-2 flex items-center gap-2 rounded shadow-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="text-body-semibold">Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[15px]">
        <div className="bg-[#17a2b8] text-white rounded overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative">
          <div className="p-4">
            <div className="text-tile-number font-tile-number">KES 84,200</div>
            <div className="text-label-sm font-body-semibold opacity-90">Total Revenue</div>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-4 text-[64px] opacity-20 pointer-events-none">payments</span>
          <div className="bg-black/10 py-1 px-4 text-[11px] flex justify-between items-center cursor-pointer hover:bg-black/20">
            View Details <span className="material-symbols-outlined text-[14px]">arrow_circle_right</span>
          </div>
        </div>
        <div className="bg-[#28a745] text-white rounded overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative">
          <div className="p-4">
            <div className="text-tile-number font-tile-number">142</div>
            <div className="text-label-sm font-body-semibold opacity-90">Transactions</div>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-4 text-[64px] opacity-20 pointer-events-none">shopping_basket</span>
          <div className="bg-black/10 py-1 px-4 text-[11px] flex justify-between items-center cursor-pointer hover:bg-black/20">
            View Details <span className="material-symbols-outlined text-[14px]">arrow_circle_right</span>
          </div>
        </div>
        <div className="bg-[#ffc107] text-[#212529] rounded overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative">
          <div className="p-4">
            <div className="text-tile-number font-tile-number">KES 593</div>
            <div className="text-label-sm font-body-semibold opacity-80">Avg. Transaction Value</div>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-4 text-[64px] opacity-20 pointer-events-none">analytics</span>
          <div className="bg-black/10 py-1 px-4 text-[11px] flex justify-between items-center cursor-pointer hover:bg-black/20">
            View Details <span className="material-symbols-outlined text-[14px]">arrow_circle_right</span>
          </div>
        </div>
        <div className="bg-[#dc3545] text-white rounded overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] relative">
          <div className="p-4">
            <div className="text-tile-number font-tile-number">KES 13,472</div>
            <div className="text-label-sm font-body-semibold opacity-90">Total VAT Collected</div>
          </div>
          <span className="material-symbols-outlined absolute right-2 top-4 text-[64px] opacity-20 pointer-events-none">receipt</span>
          <div className="bg-black/10 py-1 px-4 text-[11px] flex justify-between items-center cursor-pointer hover:bg-black/20">
            View Details <span className="material-symbols-outlined text-[14px]">arrow_circle_right</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[15px]">
        <PanelCard title="Sales by Payment Method" icon="pie_chart">
          <div className="p-6 flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#e0e3e6" strokeWidth="3" />
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#28a745" strokeDasharray="45 55" strokeDashoffset="0" strokeWidth="3" />
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#17a2b8" strokeDasharray="35 65" strokeDashoffset="-45" strokeWidth="3" />
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="#ffc107" strokeDasharray="20 80" strokeDashoffset="-80" strokeWidth="3" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-secondary">Total</span>
                <span className="font-bold">142</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 w-full max-w-sm">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28a745]"></div>
                  <span className="text-label-sm font-body-semibold">Cash</span>
                </div>
                <div className="text-body-reg">45%</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#17a2b8]"></div>
                  <span className="text-label-sm font-body-semibold">Mpesa</span>
                </div>
                <div className="text-body-reg">35%</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffc107]"></div>
                  <span className="text-label-sm font-body-semibold">Credit</span>
                </div>
                <div className="text-body-reg">20%</div>
              </div>
            </div>
          </div>
        </PanelCard>

        <PanelCard title="Cashier Performance" icon="person_outline">
          <DataTable columns={cashierColumns} rows={CASHIERS} rowKey={(c) => c.name} />
        </PanelCard>
      </div>

      <PanelCard
        title="Recent Itemized Sales"
        icon="list_alt"
        headerExtra={<span className="text-label-sm text-secondary">Showing last 20 transactions</span>}
      >
        <DataTable columns={salesColumns} rows={SALES} rowKey={(s) => s.invoice} />
        <div className="px-4 py-3 flex justify-between items-center border-t border-[#EEEEEE]">
          <span className="text-label-sm text-secondary">Showing 5 of 142 entries</span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-[#EEEEEE] bg-white hover:bg-[#F4F4F4] transition-colors">
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-primary bg-primary text-white text-[12px] font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-[#EEEEEE] bg-white hover:bg-[#F4F4F4] transition-colors text-[12px]">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-[#EEEEEE] bg-white hover:bg-[#F4F4F4] transition-colors text-[12px]">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-[#EEEEEE] bg-white hover:bg-[#F4F4F4] transition-colors">
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </PanelCard>
    </div>
  );
}