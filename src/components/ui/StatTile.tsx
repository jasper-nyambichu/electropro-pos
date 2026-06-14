interface StatTileProps {
  value: string;
  label: string;
  icon: string;
  bgColor: string;
}

export default function StatTile({ value, label, icon, bgColor }: StatTileProps) {
  return (
    <div
      className={`${bgColor} text-white rounded-sm relative overflow-hidden shadow-sm group`}
    >
      <div className="p-card_padding">
        <h3 className="text-tile-number font-tile-number">{value}</h3>
        <p className="font-body-reg opacity-90 uppercase text-[12px] tracking-wider">
          {label}
        </p>
      </div>
      <span className="material-symbols-outlined absolute right-2 top-4 text-[64px] opacity-20 group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <div className="bg-black/10 py-1 px-3 flex justify-center items-center gap-1 cursor-pointer hover:bg-black/20 transition-colors">
        <span className="text-[11px] font-body-semibold">View Detail</span>
        <span className="material-symbols-outlined text-[14px]">arrow_circle_right</span>
      </div>
    </div>
  );
}