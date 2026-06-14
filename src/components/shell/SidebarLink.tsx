"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  href: string;
  icon: string;
  label: string;
  hasChildren?: boolean;
}

export default function SidebarLink({ href, icon, label, hasChildren }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`flex items-center justify-between py-3 px-4 w-full font-sidebar-item text-sidebar-item transition-all ${
        isActive
          ? "sidebar-active text-on-secondary"
          : "text-on-secondary/70 hover:bg-on-secondary-fixed-variant hover:text-on-secondary"
      }`}
    >
      <div className="flex items-center">
        <span className="material-symbols-outlined mr-3">{icon}</span>
        <span>{label}</span>
      </div>
      {hasChildren && (
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
      )}
    </Link>
  );
}