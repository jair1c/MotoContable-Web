import { Sidebar } from "@/components/Sidebar";
import { MobileTopBar } from "@/components/MobileTopBar";
import { BottomNav } from "@/components/BottomNav";
import { PendingBanner } from "@/components/PendingBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <MobileTopBar />
        <PendingBanner />
        <div className="pb-20 md:pb-0">{children}</div>
      </div>
      <BottomNav />
    </div>
  );
}
