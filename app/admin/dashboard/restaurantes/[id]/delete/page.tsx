import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteConfirm from "@/components/dashboard/forms/DeleteConfirm";

export default async function DeleteRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (me?.role !== "SUPER_ADMIN") redirect("/admin");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!restaurant) redirect("/admin/dashboard");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Eliminar negocio</h1>
      <DeleteConfirm
        label="negocio"
        description={`¿Eliminar el negocio "${restaurant.name}"?`}
        deleteUrl={`/api/admin/restaurants/${id}`}
        backUrl="/admin/dashboard"
      />
    </div>
  );
}
