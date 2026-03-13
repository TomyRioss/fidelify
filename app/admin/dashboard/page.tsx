import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import RestaurantsTable from "@/components/dashboard/RestaurantsTable";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  const restaurants = await prisma.restaurant.findMany({
    include: { _count: { select: { branches: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Panel de Administración
        </h1>
      </div>
      <RestaurantsTable initialData={JSON.parse(JSON.stringify(restaurants))} />
    </div>
  );
}
