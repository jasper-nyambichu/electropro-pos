interface AvatarProps {
  initials: string;
  bgColor: string;
  textColor?: string;
}

export default function Avatar({ initials, bgColor, textColor = "text-on-secondary-fixed-variant" }: AvatarProps) {
  return (
    <div className={`h-10 w-10 rounded-full ${bgColor} flex items-center justify-center font-bold ${textColor}`}>
      {initials}
    </div>
  );
}