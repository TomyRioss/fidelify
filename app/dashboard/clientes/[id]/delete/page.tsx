import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteConfirm from "@/components/dashboard/forms/DeleteConfirm";

export default async function DeleteClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  const client = await prisma.client.findFirst({
    where: { id, restaurantId: me.restaurantId },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!client) redirect("/dashboard/clientes");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Eliminar cliente</h1>
      <DeleteConfirm
        label="cliente"
        description={`¿Eliminar a ${client.firstName} ${client.lastName}?`}
        deleteUrl={`/api/dashboard/clients/${id}`}
        backUrl="/dashboard/clientes"
      />
    </div>
  );
}
