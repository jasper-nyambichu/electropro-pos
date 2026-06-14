import CategoryCard from "@/components/ui/CategoryCard";

interface Category {
  name: string;
  description: string;
  icon: string;
  count: number;
  countLabel: string;
  lastModified: string;
  color: "blue" | "red" | "purple" | "amber" | "green" | "slate";
}

const CATEGORIES: Category[] = [
  {
    name: "TVs & Displays",
    description: "High-definition monitors and smart TVs",
    icon: "tv",
    count: 142,
    countLabel: "Inventory",
    lastModified: "Oct 12, 2023",
    color: "blue",
  },
  {
    name: "PA Systems",
    description: "Public address and live sound reinforcement",
    icon: "speaker_group",
    count: 86,
    countLabel: "Inventory",
    lastModified: "Nov 05, 2023",
    color: "red",
  },
  {
    name: "Audio Devices",
    description: "Headphones, speakers, and amplifiers",
    icon: "headphones",
    count: 215,
    countLabel: "Inventory",
    lastModified: "Dec 01, 2023",
    color: "purple",
  },
  {
    name: "Power & Cables",
    description: "Adapters, batteries, and connectivity",
    icon: "bolt",
    count: 534,
    countLabel: "Inventory",
    lastModified: "Nov 28, 2023",
    color: "amber",
  },
  {
    name: "Accessories",
    description: "Peripherals, bags, and mounts",
    icon: "mouse",
    count: 920,
    countLabel: "Inventory",
    lastModified: "Dec 10, 2023",
    color: "green",
  },
  {
    name: "Services",
    description: "Warranties, installations, and repairs",
    icon: "settings_suggest",
    count: 12,
    countLabel: "SKUs",
    lastModified: "Dec 08, 2023",
    color: "slate",
  },
];

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-page-title font-page-title text-on-background">Categories</h1>
          <nav className="flex text-label-sm text-secondary gap-2 items-center mt-1">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary font-bold">Categories</span>
          </nav>
        </div>
        <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-body-semibold flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[15px]">
        {CATEGORIES.map((cat) => (
          <CategoryCard key={cat.name} {...cat} />
        ))}
      </div>

      <div className="border-2 border-dashed border-outline-variant/30 rounded-lg p-8 flex flex-col items-center justify-center text-secondary opacity-60 hover:opacity-100 hover:border-primary/50 transition-all cursor-pointer group">
        <div className="w-12 h-12 rounded-full border-2 border-secondary flex items-center justify-center mb-3 group-hover:border-primary group-hover:text-primary">
          <span className="material-symbols-outlined text-[32px]">add_circle</span>
        </div>
        <p className="font-body-semibold group-hover:text-primary">Click to create a new category</p>
        <p className="text-label-sm">Organize your products for better store management</p>
      </div>
    </div>
  );
}