import PanelCard from "@/components/ui/PanelCard";
import DataTable, { Column } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";

interface Quotation {
  id: string;
  date: string;
  customer: string;
  description: string;
  total: string;
  status: "Pending" | "Accepted" | "Converted" | "Expired";
}

const QUOTATIONS: Quotation[] = [
  { id: "#QUO-8821", date: "Oct 24, 2023", customer: "Victory Church", description: "PA System Installation & Rigging", total: "$12,450.00", status: "Pending" },
  { id: "#QUO-8819", date: "Oct 22, 2023", customer: "Westgate Hotels", description: '15x 65" TV Bulk Order - Hospitality Line', total: "$24,900.00", status: "Accepted" },
  { id: "#QUO-8815", date: "Oct 20, 2023", customer: "TechNova Solutions", description: "Office Network Infrastructure Upgrade", total: "$8,200.00", status: "Converted" },
  { id: "#QUO-8799", date: "Oct 15, 2023", customer: "Gorman High School", description: "30x Student Laptops (Lease Quote)", total: "$18,000.00", status: "Expired" },
  { id: "#QUO-8782", date: "Oct 12, 2023", customer: "Riverside Cafe", description: "New POS Terminals & Thermal Printers", total: "$3,450.00", status: "Pending" },
];

const STATUS_BADGE: Record<Quotation["status"], "amber" | "emerald" | "blue" | "gray"> = {
  Pending: "amber",
  Accepted: "emerald",
  Converted: "blue",
  Expired: "gray",
};

function ActionButtons({ status }: { status: Quotation["status"] }) {
  const isConverted = status === "Converted";
  const isExpired = status === "Expired";

  return (
    <div className="flex justify-end gap-2">
      <button
        className={`p-1 rounded transition-colors ${
          isConverted ? "cursor-default opacity-30" : "hover:bg-primary-container/10"
        }`}
        title={isExpired ? "Renew" : "Edit"}
      >
        <span className="material-symbols-outlined text-[18px] text-secondary">
          {isExpired ? "refresh" : "edit"}
        </span>
      </button>
      <button
        className={`p-1 rounded transition-colors ${
          isExpired ? "cursor-default opacity-30" : "hover:bg-primary-container/10"
        }`}
        title={isConverted ? "View Linked Sale" : "Convert to Sale"}
      >
        <span className="material-symbols-outlined text-[18px] text-primary">
          {isConverted ? "link" : "point_of_sale"}
        </span>
      </button>
      <button
        className={`p-1 rounded transition-colors ${
          isConverted ? "cursor-default opacity-30" : "hover:bg-error-container/10"
        }`}
        title="Delete"
      >
        <span className="material-symbols-outlined text-[18px] text-error">delete</span>
      </button>
    </div>
  );
}

export default function QuotationsPage() {
  const columns: Column<Quotation>[] = [
    { header: "Quote ID", width: "120px", render: (q) => <span className="font-body-semibold text-primary">{q.id}</span> },
    { header: "Date", render: (q) => q.date },
    { header: "Customer", render: (q) => q.customer },
    { header: "Description", render: (q) => <span className="text-secondary">{q.description}</span> },
    { header: "Total Value", align: "right", render: (q) => <span className="font-body-semibold">{q.total}</span> },
    { header: "Status", align: "center", render: (q) => <Badge color={STATUS_BADGE[q.status]}>{q.status}</Badge> },
    { header: "Actions", align: "right", render: (q) => <ActionButtons status={q.status} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">Quotations</h1>
          <p className="text-label-sm text-secondary font-label-sm">
            Manage client quotes and proposals
          </p>
        </div>
        <button className="flex items-center bg-primary hover:opacity-90 text-on-primary px-4 py-2 rounded shadow-sm transition-opacity font-body-semibold">
          <span className="material-symbols-outlined mr-2 text-[20px]">add</span>
          New Quotation
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-secondary uppercase">Search Quotes</label>
            <div className="relative">
              <input
                className="w-full border-surface-variant focus:ring-primary focus:border-primary text-body-reg py-1.5 pl-8 rounded"
                placeholder="ID, Customer..."
                type="text"
              />
              <span className="material-symbols-outlined absolute left-2 top-2 text-secondary text-[18px]">search</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-secondary uppercase">Status Filter</label>
            <select className="border-surface-variant focus:ring-primary focus:border-primary text-body-reg py-1.5 rounded">
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Accepted</option>
              <option>Expired</option>
              <option>Converted</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-secondary uppercase">Date Range</label>
            <input className="border-surface-variant focus:ring-primary focus:border-primary text-body-reg py-1.5 rounded" type="date" />
          </div>
          <div className="flex items-end">
            <button className="bg-secondary text-on-primary px-4 py-1.5 rounded w-full hover:bg-on-secondary-fixed-variant transition-colors font-body-reg">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <PanelCard
        title="Quote Records"
        icon="list_alt"
        headerExtra={
          <div className="flex gap-2">
            <button className="text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
            <button className="text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[18px]">print</span>
            </button>
          </div>
        }
      >
        <DataTable columns={columns} rows={QUOTATIONS} rowKey={(q) => q.id} />
        <Pagination showingFrom={1} showingTo={5} total={42} currentPage={1} totalPages={9} />
      </PanelCard>
    </div>
  );
}