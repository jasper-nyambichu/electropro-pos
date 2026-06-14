interface PanelCardProps {
  title: string;
  icon?: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function PanelCard({
  title,
  icon,
  headerExtra,
  children,
  className = "",
}: PanelCardProps) {
  return (
    <div
      className={`bg-white border border-[#EEEEEE] rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden ${className}`}
    >
      <div className="bg-[#F4F4F4] px-[15px] py-[10px] border-b border-[#EEEEEE] flex justify-between items-center">
        <h3 className="font-panel-header text-panel-header text-on-surface flex items-center gap-2">
          {icon && (
            <span className="material-symbols-outlined text-primary text-[20px]">
              {icon}
            </span>
          )}
          {title}
        </h3>
        {headerExtra}
      </div>
      <div>{children}</div>
    </div>
  );
}