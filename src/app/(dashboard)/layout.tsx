import TopBar from "@/components/shell/TopBar";
import SideBar from "@/components/shell/SideBar";
import Footer from "@/components/shell/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopBar />
      <SideBar />
      <main className="pt-[50px] md:pl-[220px] min-h-screen pb-[40px]">
        <div className="p-5">{children}</div>
      </main>
      <Footer />
    </>
  );
}