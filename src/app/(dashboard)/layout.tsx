import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc]">
      <Sidebar className="hidden md:block" />
      <div className="flex-1 bg-[#f8fafc] md:overflow-auto">
        <MobileNav />
        <div className="min-h-screen md:min-h-0">{children}</div>
      </div>
    </div>
  );
}
