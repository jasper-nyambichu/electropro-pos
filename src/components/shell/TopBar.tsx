"use client";

import { useEffect, useState } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { getUser, type AuthUser } from "@/lib/auth";

function formatNow(date: Date) {
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11 ? "st" :
    day % 10 === 2 && day !== 12 ? "nd" :
    day % 10 === 3 && day !== 13 ? "rd" : "th";

  const datePart = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const timePart = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return `${day}${suffix} ${datePart} ${timePart}`;
}

export default function TopBar() {
  const { toggleOpen, toggleCollapsed, collapsed } = useSidebar();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setUser(getUser());
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000 * 30); // refresh every 30s
    return () => clearInterval(timer);
  }, []);

  const initials = user?.firstname
    ? user.firstname.charAt(0).toUpperCase()
    : "?";

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-gutter h-[50px] bg-primary text-on-primary shadow-sm border-b border-outline-variant">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={toggleOpen}
          className="md:hidden hover:bg-primary-container/20 p-1.5 rounded transition-colors"
          aria-label="Toggle mobile menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex hover:bg-primary-container/20 p-1.5 rounded transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="material-symbols-outlined">
            {collapsed ? "menu_open" : "menu"}
          </span>
        </button>

        <span className="font-page-title text-page-title font-bold text-on-primary">
          ElectroPro POS
        </span>

        <div className="hidden md:flex items-center gap-3 ml-2">
          <button className="hover:bg-primary-container/20 p-1 rounded transition-colors">
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button className="hover:bg-primary-container/20 p-1 rounded transition-colors">
            <span className="material-symbols-outlined">restore</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden lg:block font-label-sm text-label-sm opacity-90">
          {now ? formatNow(now) : ""}
        </span>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined cursor-pointer hover:bg-primary-container/20 p-1 rounded">print</span>
          <span className="material-symbols-outlined cursor-pointer hover:bg-primary-container/20 p-1 rounded">notifications</span>
          <span className="hidden sm:inline material-symbols-outlined cursor-pointer hover:bg-primary-container/20 p-1 rounded">computer</span>
          <span className="hidden sm:inline material-symbols-outlined cursor-pointer hover:bg-primary-container/20 p-1 rounded">volume_up</span>
        </div>
        <div className="flex items-center gap-2 border-l border-white/20 pl-3 ml-1">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
            {initials}
          </div>
          <span className="font-body-semibold text-body-semibold hidden sm:inline">
            {user?.firstname ?? "Guest"}
          </span>
        </div>
      </div>
    </header>
  );
}