import StatTile from "@/components/ui/StatTile";
import PanelCard from "@/components/ui/PanelCard";
import DataTable, { Column } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";

interface Sale {
  id: string;
  date: string;
  items: string;
  payment: "Mpesa" | "Credit" | "Cash";
  total: string;
  status: "Completed" | "Voided";
}

const SALES: Sale[] = [
  { id: "#SAL-89230", date: "2024-05-18 14:32", items: "iPhone 15 Pro, Case x2", payment: "Mpesa", total: "164,500.00", status: "Completed" },
  { id: "#SAL-89229", date: "2024-05-18 13:15", items: "Logitech MX Master 3S", payment: "Credit", total: "12,500.00", status: "Completed" },
  { id: "#SAL-89228", date: "2024-05-18 11:45", items: "Samsung T7 1TB SSD", payment: "Cash", total: "15,800.00", status: "Voided" },
  { id: "#SAL-89227", date: "2024-05-18 10:20", items: "MacBook Air M2, Hub", payment: "Mpesa", total: "185,000.00", status: "Completed" },
  { id: "#SAL-89226", date: "2024-05-17 18:50", items: 'Dell UltraSharp 27"', payment: "Credit", total: "54,200.00", status: "Completed" },
  { id: "#SAL-89225", date: "2024-05-17 16:10", items: "AirPods Pro Gen 2", payment: "Cash", total: "32,000.00", status: "Completed" },
  { id: "#SAL-89224", date: "2024-05-17 14:05", items: "Anker PowerBank 20k", payment: "Mpesa", total: "7,500.00", status: "Completed" },
  { id: "#SAL-89223", date: "2024-05-17 11:30", items: "Keychron K2 V2", payment: "Cash", total: "14,200.00", status: "Completed" },
];

const PAYMENT_DOT: Record<Sale["payment"], string> = {
  Mpesa: "bg-green-500",
  Credit: "bg-blue-500",
  Cash: "bg-gray-500",
};

const WEEKLY_DATA = [
  { day: "Mon", height: 60 },
  { day: "Tue", height: 85 },
  { day: "Wed", height: 45 },
  { day: "Thu", height: 70 },
  { day: "Fri", height: 95 },
  { day: "Sat", height: 30 },
  { day: "Sun", height: 20 },
];

export default function SalesPage() {
  const columns: Column<Sale>[] = [
    { header: "Sale ID", render: (s) => <span className="font-body-semibold text-primary">{s.id}</span> },
    { header: "Date", render: (s) => s.date },
    { header: "Items", render: (s) => s.items },
    {
      header: "Payment Method",
      render: (s) => (
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${PAYMENT_DOT[s.payment]}`}></span> {s.payment}
        </span>
      ),
    },
    { header: "Total (KES)", render: (s) => <span className="font-body-semibold text-primary">{s.total}</span> },
    {
      header: "Status",
      align: "center",
      render: (s) => <Badge color={s.status === "Completed" ? "green" : "red"}>{s.status}</Badge>,
    },
    {
      header: "Actions",
      align: "right",
      render: (s) => (
        <div className="flex justify-end gap-2">
          <button className="text-secondary hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>
          <button className="text-secondary hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">
              {s.status === "Voided" ? "undo" : "edit"}
            </span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-gutter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">Sales Overview</h1>
          <p className="text-secondary font-label-sm text-label-sm">
            Manage and track all customer transactions
          </p>
        </div>
        <button className="bg-primary text-on-primary px-4 py-2 rounded-sm font-body-semibold hover:bg-primary-container transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined">add</span>
          New Sale
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <StatTile value="KES 142k" label="Revenue Today" icon="payments" bgColor="bg-[#00c0ef]" />
        <StatTile value="48" label="Transactions" icon="shopping_bag" bgColor="bg-[#00a65a]" />
        <StatTile value="KES 2,958" label="Avg Sale Value" icon="trending_up" bgColor="bg-[#f39c12]" />
        <StatTile value="KES 19.4k" label="VAT (16%) Collected" icon="account_balance" bgColor="bg-[#dd4b39]" />
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 p-4 rounded-sm shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="font-label-sm text-secondary">Date:</label>
          <input className="border-outline-variant/30 text-body-reg py-1 px-2 focus:border-primary outline-none rounded-sm" type="date" />
        </div>
        <div className="flex items-center gap-2">
          <label className="font-label-sm text-secondary">Payment:</label>
          <select className="border-outline-variant/30 text-body-reg py-1 px-2 focus:border-primary outline-none rounded-sm bg-white">
            <option>All Methods</option>
            <option>Cash</option>
            <option>Mpesa</option>
            <option>Credit</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-label-sm text-secondary">Status:</label>
          <select className="border-outline-variant/30 text-body-reg py-1 px-2 focus:border-primary outline-none rounded-sm bg-white">
            <option>All Status</option>
            <option>Completed</option>
            <option>Voided</option>
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2 w-full md:w-auto">
          <input
            className="border-outline-variant/30 text-body-reg py-1 px-2 focus:border-primary outline-none rounded-sm w-full md:w-64"
            placeholder="Search by ID or Customer..."
            type="text"
          />
          <button className="bg-secondary text-white px-3 py-1.5 rounded-sm hover:bg-on-secondary-fixed-variant transition-colors">
            <span className="material-symbols-outlined text-[18px]">filter_alt</span>
          </button>
        </div>
      </div>

      <PanelCard
        title="Recent Sales Transactions"
        icon="list_alt"
        headerExtra={
          <div className="flex items-center gap-2">
            <button className="text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
            <button className="text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">print</span>
            </button>
          </div>
        }
      >
        <DataTable columns={columns} rows={SALES} rowKey={(s) => s.id} />
        <Pagination showingFrom={1} showingTo={8} total={1245} currentPage={1} totalPages={156} />
      </PanelCard>

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-sm shadow-sm p-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-panel-header text-panel-header">Weekly Sales Trend</h3>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-primary"></span> Revenue
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-secondary"></span> Target
            </span>
          </div>
        </div>
        <div className="h-48 w-full flex items-end justify-between gap-2 px-2 relative">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            <div className="border-t border-outline-variant/10 w-full h-px"></div>
            <div className="border-t border-outline-variant/10 w-full h-px"></div>
            <div className="border-t border-outline-variant/10 w-full h-px"></div>
            <div className="border-t border-outline-variant/10 w-full h-px"></div>
          </div>
          {WEEKLY_DATA.map((d) => (
            <div
              key={d.day}
              className="flex-1 bg-primary-container/10 relative group hover:bg-primary-container/20 transition-all cursor-pointer"
              style={{ height: `${d.height}%` }}
            >
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-inverse-surface text-white px-1 rounded-sm">
                {d.day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}