import DataTable, { Column } from "@/components/ui/DataTable";
import PanelCard from "@/components/ui/PanelCard";
import Pagination from "@/components/ui/Pagination";
import StatBanner from "@/components/ui/StatBanner";

interface Warranty {
  customer: string;
  product: string;
  serial: string;
  saleDate: string;
  expiryDate: string;
  daysLeft: string;
  status: "Expiring Soon" | "Active" | "Expired";
  action: "Manage" | "Renew";
}

const WARRANTIES: Warranty[] = [
  { customer: "Marcus Holloway", product: "MacBook Pro M3 Max", serial: "MBP2023-99420", saleDate: "12 Jan 2023", expiryDate: "12 Jan 2024", daysLeft: "-2 Days", status: "Expiring Soon", action: "Manage" },
  { customer: "Elena Rodriguez", product: "Sony A7R V Camera", serial: "SNY-AR5-0012", saleDate: "05 Mar 2023", expiryDate: "05 Mar 2025", daysLeft: "420 Days", status: "Active", action: "Manage" },
  { customer: "Jared Sterling", product: "LG UltraFine 5K Display", serial: "LGD-5K-92811", saleDate: "15 Nov 2022", expiryDate: "15 Nov 2023", daysLeft: "Expired", status: "Expired", action: "Renew" },
  { customer: "Amina Sheikh", product: 'iPad Pro 12.9" 1TB', serial: "IPD-P12-8871", saleDate: "22 Jan 2023", expiryDate: "22 Jan 2024", daysLeft: "8 Days", status: "Expiring Soon", action: "Manage" },
  { customer: "Tobias Meyer", product: "Bose QuietComfort 45", serial: "BSE-QC45-120", saleDate: "10 Jun 2023", expiryDate: "10 Jun 2024", daysLeft: "148 Days", status: "Active", action: "Manage" },
  { customer: "Li Wei", product: "Nvidia RTX 4090 GPU", serial: "NV4090-FE-881", saleDate: "01 Sep 2023", expiryDate: "01 Sep 2026", daysLeft: "960 Days", status: "Active", action: "Manage" },
  { customer: "Sarah Jenkins", product: "Dyson V15 Detect", serial: "DYS-V15-X99", saleDate: "14 Feb 2023", expiryDate: "14 Feb 2024", daysLeft: "31 Days", status: "Expiring Soon", action: "Manage" },
  { customer: "Kevin Durant", product: "Samsung Odyssey G9", serial: "SAM-G9-DQ44", saleDate: "12 Oct 2022", expiryDate: "12 Oct 2023", daysLeft: "Expired", status: "Expired", action: "Renew" },
];

const STATUS_STYLE: Record<Warranty["status"], { pill: string; daysClass: string; rowClass: string }> = {
  "Expiring Soon": { pill: "bg-error text-on-error", daysClass: "text-error font-bold", rowClass: "" },
  Active: { pill: "bg-secondary-container text-on-secondary-container", daysClass: "text-secondary", rowClass: "" },
  Expired: { pill: "bg-secondary text-white", daysClass: "text-secondary font-bold", rowClass: "opacity-70 bg-surface-container-low" },
};

export default function WarrantyTrackerPage() {
  const columns: Column<Warranty>[] = [
    { header: "Customer", render: (w) => <span className="font-body-semibold">{w.customer}</span> },
    { header: "Product", render: (w) => w.product },
    { header: "Serial No.", render: (w) => <span className="text-secondary font-mono text-[12px]">{w.serial}</span> },
    { header: "Sale Date", render: (w) => w.saleDate },
    {
      header: "Expiry Date",
      render: (w) =>
        w.status === "Expiring Soon" ? (
          <span className="font-body-semibold text-error">{w.expiryDate}</span>
        ) : (
          w.expiryDate
        ),
    },
    { header: "Days Left", render: (w) => <span className={STATUS_STYLE[w.status].daysClass}>{w.daysLeft}</span> },
    {
      header: "Status",
      render: (w) => (
        <span className={`status-pill ${STATUS_STYLE[w.status].pill}`}>{w.status}</span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (w) => <button className="text-primary hover:underline font-bold text-label-sm">{w.action}</button>,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-page-title text-page-title text-on-surface">Warranty Tracker</h1>
          <p className="text-label-sm text-secondary">
            Manage customer product warranties and expiration alerts
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-primary text-on-primary px-3 py-1.5 text-label-sm font-bold rounded flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Warranty
          </button>
          <button className="bg-secondary text-on-primary px-3 py-1.5 text-label-sm font-bold rounded flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-error text-on-error p-3 rounded flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[24px]">warning</span>
          <div>
            <p className="font-body-semibold">Attention: 14 Warranties Expiring Soon</p>
            <p className="text-[12px] opacity-90">
              Please review the customers marked in red and initiate follow-up for renewals or
              maintenance checks.
            </p>
          </div>
        </div>
        <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-[12px] font-bold uppercase transition-colors">
          View All
        </button>
      </div>

      <PanelCard
        title="Customer Warranty List"
        icon="assignment_turned_in"
        headerExtra={
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-label-sm text-secondary">
              <span className="w-3 h-3 rounded-full bg-error"></span> Expiring
            </div>
            <div className="flex items-center gap-2 text-label-sm text-secondary">
              <span className="w-3 h-3 rounded-full bg-secondary"></span> Expired
            </div>
            <div className="flex items-center gap-2 text-label-sm text-secondary">
              <span className="w-3 h-3 rounded-full bg-primary-container"></span> Active
            </div>
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={WARRANTIES}
          rowKey={(w) => w.serial}
        />
        <Pagination showingFrom={1} showingTo={8} total={142} currentPage={1} totalPages={18} />
      </PanelCard>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatBanner value="1,402" label="Total Registered" icon="inventory_2" bgColor="bg-primary" footerText="" />
        <StatBanner value="14" label="Expiring 30 Days" icon="timer" bgColor="bg-error" footerText="" />
        <StatBanner value="42" label="Claims Filed" icon="block" bgColor="bg-secondary" footerText="" />
        <StatBanner value="92%" label="Protection Ratio" icon="verified_user" bgColor="bg-on-secondary-fixed-variant" footerText="" />
      </div>
    </div>
  );
}