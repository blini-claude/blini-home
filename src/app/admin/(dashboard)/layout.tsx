import { Sidebar } from "@/components/admin/sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <Sidebar />
      <div className="flex-1 ml-[220px]">{children}</div>
    </div>
  );
}
