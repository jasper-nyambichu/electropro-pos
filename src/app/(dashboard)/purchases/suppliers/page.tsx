import StatBanner from "@/components/ui/StatBanner";
import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";
import Pagination from "@/components/ui/Pagination";

interface Supplier {
  name: string;
  contact: string;
  phone: string;
  productsLabel: string;
  productsBg: string;
  productsText: string;
  totalPurchased: string;
  lastOrder: string;
}

const SUPPLIERS: Supplier[] = [
  { name: "Samsung Kenya", contact: "James Kimani", phone: "+254 711 000 111", productsLabel: "Mobile, TV, SSD", productsBg: "bg-blue-100", productsText: "text-blue-800", totalPurchased: "4,250,000", lastOrder: "Oct 12, 2024" },
  { name: "Yamaha Music", contact: "Sarah Omondi", phone: "+254 722 999 888", productsLabel: "Audio, Synths", productsBg: "bg-purple-100", productsText: "text-purple-800", totalPurchased: "1,120,500", lastOrder: "Sep 28, 2024" },
  { name: "LG East Africa", contact: "Michael Otieno", phone: "+254 733 444 555", productsLabel: "Displays, AC", productsBg: "bg-red-100", productsText: "text-red-800", totalPurchased: "2,890,000", lastOrder: "Oct 05, 2024" },
  { name: "Anker Solutions", contact: "Linus Torvalds", phone: "+254 700 123 456", productsLabel: "Power, Cables", productsBg: "bg-amber-100", productsText: "text-amber-800", totalPurchased: "450,000", lastOrder: "Oct 14, 2024" },
  { name: "Sony Kenya Ltd", contact: "Grace Wambui", phone: "+254 788 555 666", productsLabel: "Cameras, Audio", productsBg: "bg-slate-100", productsText: "text-slate-800", totalPurchased: "3,125,000", lastOrder: "Sep 15, 2024" },
  { name: "HP Distribution", contact: "Kevoh M.", phone: "+254 712 345 678", productsLabel: "Laptops, Printers", productsBg: "bg-cyan-100", productsText: "text-cyan-800", totalPurchased: "2,440,000", lastOrder: "Oct 10, 2024" },
];

export default function SuppliersPage() {
  const columns: Column<Supplier>[] = [
    { header: "Supplier Name", render: (s) => <span className="font-body-semibold">{s.name}</span> },
    { header: "Contact", render: (s) => s.contact },
    { header: "Phone", render: (s) => s.phone },
    {
      header: "Products Supplied",
      render: (s) => (
        <span className={`${s.productsBg} ${s.productsText} text-[10px] px-2 py-0.5 rounded font-bold uppercase`}>
          {s.productsLabel}
        </span>
      ),
    },
    { header: "Total Purchased (KES)", align: "right", render: (s) => s.totalPurchased },
    { header: "Last Order", render: (s) => s.lastOrder },
    {
      header: "Actions",
      align: "center",
      render: () => (
        <div className="flex justify-center gap-2">
          <button className="text-blue-600 hover:text-blue-800">
            <span className="material-symbols-outlined text-[18px]">visibility</span>
          </button>
          <button className="text-secondary hover:text-primary">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-page-title text-page-title text-on-background">Suppliers</h1>
          <p className="text-label-sm font-label-sm text-secondary">
            Manage your relationship with inventory providers
          </p>
        </div>
        <button className="bg-primary hover:bg-primary-fixed-dim text-on-primary px-4 py-2 flex items-center gap-2 rounded-lg shadow-sm transition-all active:opacity-90">
          <span className="material-symbols-outlined">person_add</span>
          <span className="font-body-semibold text-body-semibold">Add Supplier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-[15px]">
        <StatBanner value="42" label="Total Suppliers" icon="factory" bgColor="bg-blue-600" footerText="View full list" />
        <StatBanner value="12" label="Pending Orders" icon="local_shipping" bgColor="bg-primary-container" footerText="Tracking dashboard" />
        <StatBanner value="14.2M" label="Annual Spend" icon="payments" bgColor="bg-green-600" footerText="KES Valuation" />
        <StatBanner value="Samsung Kenya" label="Top Partner" icon="verified" bgColor="bg-on-secondary-fixed-variant" footerText="High reliability" />
      </div>

      <PanelCard
        title="Supplier Directory"
        icon="list_alt"
        headerExtra={
          <div className="flex gap-2">
            <button className="text-label-sm font-label-sm px-2 py-1 border border-outline-variant hover:bg-surface-container transition-colors rounded">
              Export CSV
            </button>
            <button className="text-label-sm font-label-sm px-2 py-1 border border-outline-variant hover:bg-surface-container transition-colors rounded">
              Print
            </button>
          </div>
        }
      >
        <DataTable columns={columns} rows={SUPPLIERS} rowKey={(s) => s.name} />
        <Pagination showingFrom={1} showingTo={6} total={42} currentPage={1} totalPages={7} />
      </PanelCard>
    </div>
  );
}