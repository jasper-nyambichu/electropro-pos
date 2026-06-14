type BadgeColor =
  | "green"
  | "red"
  | "amber"
  | "blue"
  | "gray"
  | "emerald";

const COLOR_MAP: Record<BadgeColor, string> = {
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
  gray: "bg-gray-100 text-gray-600",
  emerald: "bg-emerald-100 text-emerald-700",
};

interface BadgeProps {
  color: BadgeColor;
  children: React.ReactNode;
}

export default function Badge({ color, children }: BadgeProps) {
  return (
    <span
      className={`${COLOR_MAP[color]} px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider`}
    >
      {children}
    </span>
  );
}