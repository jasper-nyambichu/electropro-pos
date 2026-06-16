"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { NavItem } from "@/lib/constants";

interface Props {
  item: NavItem;
}

export default function SidebarLink({ item }: Props) {
  const pathname = usePathname();
  const hasChildren = !!item.children?.length;

  const isChildActive = hasChildren
    ? item.children!.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"))
    : false;

  const isDirectActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const isActive = hasChildren ? isChildActive : isDirectActive;

  const [open, setOpen] = useState(isChildActive);

  // Keep the dropdown open if navigation lands on one of its children
  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        className={`flex items-center justify-between py-3 px-4 w-full font-sidebar-item text-sidebar-item transition-all ${
          isActive
            ? "sidebar-active text-on-secondary"
            : "text-on-secondary/70 hover:bg-on-secondary-fixed-variant hover:text-on-secondary"
        }`}
      >
        <div className="flex items-center">
          <span className="material-symbols-outlined mr-3">{item.icon}</span>
          <span>{item.label}</span>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between py-3 px-4 w-full font-sidebar-item text-sidebar-item transition-all ${
          isActive
            ? "sidebar-active text-on-secondary"
            : "text-on-secondary/70 hover:bg-on-secondary-fixed-variant hover:text-on-secondary"
        }`}
      >
        <div className="flex items-center">
          <span className="material-symbols-outlined mr-3">{item.icon}</span>
          <span>{item.label}</span>
        </div>
        <span
          className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
            open ? "rotate-90" : ""
          }`}
        >
          chevron_right
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? "max-h-[200px]" : "max-h-0"
        }`}
      >
        <div className="flex flex-col bg-on-secondary-fixed/40">
          {item.children!.map((child) => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                className={`flex items-center py-2 pl-[52px] pr-4 font-sidebar-item text-[13px] transition-all ${
                  childActive
                    ? "text-on-primary font-body-semibold border-l-4 border-primary bg-inverse-surface"
                    : "text-on-secondary/60 hover:bg-on-secondary-fixed-variant hover:text-on-secondary"
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}