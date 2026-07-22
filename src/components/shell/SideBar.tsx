"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import SidebarLink from "./SidebarLink";
import { NAV_ITEMS } from "@/lib/constants";
import { getUser, logout, type AuthUser } from "@/lib/auth";

export default function SideBar() {
  const { open, collapsed, close } = useSidebar();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  // Close mobile drawer on navigation
  useEffect(() => {
    close();
  }, [pathname, close]);

  function handleLogout() {
    if (!confirm("Are you sure you want to log out?")) return;
    logout();
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        onClick={close}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={`
          fixed left-0 top-[50px] h-[calc(100vh-50px)] z-50
          bg-secondary text-on-secondary flex flex-col
          overflow-y-auto custom-scrollbar
          transition-all duration-300 ease-in-out
          border-r border-outline-variant/20
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${collapsed ? "md:w-[60px]" : "md:w-[220px]"}
          w-[220px]
        `}
      >
        {/* Sidebar brand header (visible when not collapsed) */}
        {!collapsed && (
          <div className="hidden md:flex items-center px-4 py-3 border-b border-outline-variant/20">
            <span className="text-on-primary font-panel-header text-panel-header">ElectroPro</span>
          </div>
        )}

        {/* Nav items */}
        <div className="flex flex-col py-2 flex-1">
          {NAV_ITEMS.map((item) =>
            collapsed ? (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className="flex items-center justify-center py-3 px-2 text-on-secondary/70 hover:bg-on-secondary-fixed-variant hover:text-on-secondary transition-all"
              >
                <span className="material-symbols-outlined">{item.icon}</span>
              </Link>
            ) : (
              <SidebarLink key={item.href} item={item} />
            )
          )}
        </div>

        {/* Footer: current user + logout */}
        <div className="border-t border-outline-variant/20 py-2">
          {!collapsed && user && (
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="w-7 h-7 rounded-full bg-on-secondary/20 flex items-center justify-center text-[11px] font-bold shrink-0">
                {user.firstname?.charAt(0).toUpperCase() ?? "?"}
              </div>
              <div className="min-w-0">
                <p className="font-sidebar-item text-sidebar-item leading-tight truncate">
                  {user.firstname}
                </p>
                <p className="text-[11px] text-on-secondary/60 leading-tight capitalize">
                  {user.role?.toLowerCase()}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Log out"
            className={`flex items-center w-full py-3 text-on-secondary/70 hover:bg-on-secondary-fixed-variant hover:text-on-secondary transition-all ${
              collapsed ? "justify-center px-2" : "px-4"
            }`}
          >
            <span className="material-symbols-outlined mr-3">logout</span>
            {!collapsed && <span className="font-sidebar-item text-sidebar-item">Log out</span>}
          </button>
        </div>
      </aside>

      {/* Desktop main content offset — pushes content right when sidebar is open */}
      <style>{`
        @media (min-width: 768px) {
          #main-content, #app-footer {
            margin-left: ${collapsed ? "60px" : "220px"};
          }
        }
      `}</style>
    </>
  );
}