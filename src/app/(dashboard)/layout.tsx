import TopBar from "@/components/shell/TopBar";
import SideBar from "@/components/shell/SideBar";
import Footer from "@/components/shell/Footer";
import { SidebarProvider } from "@/context/SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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