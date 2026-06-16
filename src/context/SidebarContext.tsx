"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface SidebarContextType {
  open: boolean;
  collapsed: boolean;
  toggleOpen: () => void;
  toggleCollapsed: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  open: false,
  collapsed: false,
  toggleOpen: () => {},
  toggleCollapsed: () => {},
  close: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false); // mobile drawer open
  const [collapsed, setCollapsed] = useState(false); // desktop collapsed

  const toggleOpen = useCallback(() => setOpen((o) => !o), []);
  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <SidebarContext.Provider value={{ open, collapsed, toggleOpen, toggleCollapsed, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}