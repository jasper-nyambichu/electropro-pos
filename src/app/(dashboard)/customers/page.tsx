import Avatar from "@/components/ui/Avatar";
import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";
import Pagination from "@/components/ui/Pagination";

interface Customer {
  name: string;
  subtitle: string;
  initials: string;
  avatarBg: string;
  textColor?: string;
  phone: string;
  email: string;
  location: string;
  purchases: number;
  totalSpent: string;
}

const CUSTOMERS: Customer[] = [
  { name: "James Mwangi", subtitle: "Joined Oct 2023", initials: "JM", avatarBg: "bg-primary-fixed", phone: "+254 712 345 678", email: "james.mwangi@example.ke", location: "Nairobi, KE", purchases: 12, totalSpent: "84,500.00" },
  { name: "Victory Church", subtitle: "Corporate Account", initials: "VC", avatarBg: "bg-secondary-fixed", phone: "+254 722 111 222", email: "info@victorychurch.or.ke", location: "Mombasa, KE", purchases: 45, totalSpent: "342,900.50" },
  { name: "Sarah Njeri", subtitle: "Joined Dec 2023", initials: "SN", avatarBg: "bg-tertiary-fixed", phone: "+254 733 999 888", email: "snjeri@gmail.com", location: "Nairobi, KE", purchases: 8, totalSpent: "12,400.00" },
  { name: "David Kimani", subtitle: "Joined Jan 2024", initials: "DK", avatarBg: "bg-primary-fixed-dim", phone: "+254 701 555 666", email: "d.kimani@outlook.com", location: "Nakuru, KE", purchases: 3, totalSpent: "5,600.00" },
  { name: "Elizabeth Otieno", subtitle: "Joined Nov 2023", initials: "EO", avatarBg: "bg-secondary-fixed-dim", phone: "+254 755 444 333", email: "e.otieno@biz.co.ke", location: "Kisumu, KE", purchases: 21, totalSpent: "156,200.00" },
  { name: "Mary Mutua", subtitle: "Joined Sep 2023", initials: "MM", avatarBg: "bg-tertiary-fixed-dim", phone: "+254 788 123 456", email: "m.mutua@gmail.com", location: "Machakos, KE", purchases: 6, totalSpent: "28,750.00" },
  { name: "Samuel Abiola", subtitle: "Joined Feb 2024", initials: "SA", avatarBg: "bg-outline-variant", phone: "+254 744 777 888", email: "s.abiola@outlook.com", location: "Nairobi, KE", purchases: 2, totalSpent: "1,200.00" },
  { name: "Hotel Legacy", subtitle: "VIP Corporate", initials: "HL", avatarBg: "bg-primary-container", textColor: "text-white", phone: "+254 720 000 000", email: "procurement@hotellegacy.co.ke", location: "Mombasa, KE", purchases: 89, totalSpent: "1,120,450.00" },
];

export default function CustomersPage() {
  const columns: Column<Customer>[] = [
    {
      header: "Customer Name",
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar initials={c.initials} bgColor={c.avatarBg} textColor={c.textColor} />
          <div>
            <div className="font-body-semibold">{c.name}</div>
            <div className="text-[11px] text-secondary">{c.subtitle}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact Info",
      render: (c) => (
        <div>
          <div className="text-on-surface">{c.phone}</div>
          <div className="text-label-sm text-secondary">{c.email}</div>
        </div>
      ),
    },
    { header: "Location", render: (c) => c.location },
    { header: "Purchases", align: "center", render: (c) => c.purchases },
    {
      header: "Total Spent (KES)",
      align: "right",
      render: (c) => <span className="font-body-semibold text-primary">{c.totalSpent}</span>,
    },
    {
      header: "Actions",
      align: "center",
      render: () => (
        <div className="flex justify-center gap-1">
          <button className="p-1.5 hover:bg-secondary-container rounded text-secondary transition-colors">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button className="p-1.5 hover:bg-error-container rounded text-error transition-colors">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-gutter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">Customer Directory</h1>
          <p className="text-label-sm text-secondary">
            Manage and track your customer base and their purchasing behavior.
          </p>
        </div>
        <button className="bg-primary hover:bg-primary-container text-on-primary font-body-semibold px-4 py-2 rounded flex items-center gap-2 shadow-sm transition-all active:scale-95">
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Add Customer
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded p-4 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
              filter_list
            </span>
            <input
              className="w-full pl-10 pr-3 py-2 border border-outline-variant/50 rounded focus:ring-1 focus:ring-primary focus:border-primary text-body-reg bg-surface"
              placeholder="Filter by name or email..."
              type="text"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select className="border border-outline-variant/50 rounded py-2 px-3 text-body-reg bg-surface focus:ring-1 focus:ring-primary">
            <option>All Locations</option>
            <option>Nairobi</option>
            <option>Mombasa</option>
            <option>Kisumu</option>
          </select>
          <select className="border border-outline-variant/50 rounded py-2 px-3 text-body-reg bg-surface focus:ring-1 focus:ring-primary">
            <option>Sort by: Newest</option>
            <option>Total Spent (High to Low)</option>
            <option>Total Spent (Low to High)</option>
            <option>Alphabetical</option>
          </select>
          <button className="p-2 border border-outline-variant/50 rounded hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-secondary">download</span>
          </button>
        </div>
      </div>

      <PanelCard
        title="Active Customers"
        icon="list_alt"
        headerExtra={<span className="text-label-sm text-secondary">Displaying 8 of 1,240 entries</span>}
      >
        <DataTable columns={columns} rows={CUSTOMERS} rowKey={(c) => c.name} />
        <Pagination showingFrom={1} showingTo={8} total={1240} currentPage={1} totalPages={155} />
      </PanelCard>
    </div>
  );
}