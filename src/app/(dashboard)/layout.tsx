"use client";

import TopBar from "@/components/shell/TopBar";
import SideBar from "@/components/shell/SideBar";
import Footer from "@/components/shell/Footer";
import { SidebarProvider } from "@/context/SidebarContext";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <TopBar />
      <SideBar />
      <main
        id="main-content"
        className="pt-[50px] min-h-screen pb-[40px] transition-all duration-300"
      >
        <div className="p-5">{children}</div>
      </main>
      <Footer />
    </SidebarProvider>
  );
}