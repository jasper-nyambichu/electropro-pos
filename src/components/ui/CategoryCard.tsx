type CategoryColor = "blue" | "red" | "purple" | "amber" | "green" | "slate";

interface CategoryCardProps {
  name: string;
  description: string;
  icon: string;
  count: number;
  countLabel: string;
  lastModified: string;
  color: CategoryColor;
}

const COLOR_STYLES: Record<CategoryColor, { header: string; iconBg: string; number: string; link: string }> = {
  blue: {
    header: "bg-blue-50 border-blue-100",
    iconBg: "bg-blue-600",
    number: "text-blue-700",
    link: "text-blue-600",
  },
  red: {
    header: "bg-red-50 border-red-100",
    iconBg: "bg-red-600",
    number: "text-red-700",
    link: "text-red-600",
  },
  purple: {
    header: "bg-purple-50 border-purple-100",
    iconBg: "bg-purple-600",
    number: "text-purple-700",
    link: "text-purple-600",
  },
  amber: {
    header: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-600",
    number: "text-amber-700",
    link: "text-amber-700",
  },
  green: {
    header: "bg-green-50 border-green-100",
    iconBg: "bg-green-600",
    number: "text-green-700",
    link: "text-green-700",
  },
  slate: {
    header: "bg-slate-100 border-slate-200",
    iconBg: "bg-slate-600",
    number: "text-slate-700",
    link: "text-slate-600",
  },
};

export default function CategoryCard({
  name,
  description,
  icon,
  count,
  countLabel,
  lastModified,
  color,
}: CategoryCardProps) {
  const styles = COLOR_STYLES[color];

  return (
    <div className="bg-white rounded-lg border border-surface-variant overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col">
      <div className={`flex items-center p-4 border-b ${styles.header}`}>
        <div className={`w-12 h-12 rounded-lg ${styles.iconBg} flex items-center justify-center text-white mr-4`}>
          <span className="material-symbols-outlined text-[28px]">{icon}</span>
        </div>
        <div>
          <h3 className="text-panel-header font-panel-header text-on-background">{name}</h3>
          <p className="text-label-sm text-secondary">{description}</p>
        </div>
      </div>

      <div className="p-4 flex-grow flex items-center justify-between">
        <div>
          <span className="text-label-sm text-secondary uppercase font-bold tracking-wider">
            {countLabel}
          </span>
          <div className={`text-tile-number font-tile-number ${styles.number}`}>{count}</div>
        </div>
        <div className="text-right">
          <span className="text-label-sm text-secondary">Last modified</span>
          <div className="text-body-reg text-on-background">{lastModified}</div>
        </div>
      </div>

      <div className="bg-surface-container-low px-4 py-2.5 flex justify-end gap-4 border-t border-surface-variant">
        <a className={`text-label-sm ${styles.link} font-bold hover:underline flex items-center gap-1`} href="#">
          <span className="material-symbols-outlined text-[14px]">edit</span> Edit
        </a>
        <a className="text-label-sm text-error font-bold hover:underline flex items-center gap-1" href="#">
          <span className="material-symbols-outlined text-[14px]">delete</span> Delete
        </a>
      </div>
    </div>
  );
}