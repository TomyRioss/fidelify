import { redirect } from "next/navigation";
import { auth } from "@/auth";
import BusinessSidebar from "@/components/dashboard/BusinessSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-white">
      <BusinessSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
