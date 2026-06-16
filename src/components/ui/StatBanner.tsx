interface StatBannerProps {
  value: string;
  label: string;
  icon: string;
  bgColor: string;
  footerText: string;
}

export default function StatBanner({ value, label, icon, bgColor, footerText }: StatBannerProps) {
  return (
    <div className={`${bgColor} p-4 rounded text-on-primary shadow-sm relative overflow-hidden group`}>
      <span className="material-symbols-outlined absolute right-[-10px] top-[-10px] text-[80px] opacity-20 transform group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <p className="text-label-sm uppercase tracking-wider font-bold opacity-80">{label}</p>
      <p className="text-tile-number font-tile-number">{value}</p>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10"></div>
      <div className="relative z-10 text-[11px] mt-1 opacity-90">{footerText}</div>
    </div>
  );
}