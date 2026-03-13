import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteConfirm from "@/components/dashboard/forms/DeleteConfirm";

export default async function DeleteEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  const emp = await prisma.user.findFirst({
    where: { id, restaurantId: me.restaurantId },
    select: { id: true, name: true },
  });
  if (!emp) redirect("/dashboard/empleados");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Eliminar empleado</h1>
      <DeleteConfirm
        label="empleado"
        description={`¿Eliminar a ${emp.name}?`}
        deleteUrl={`/api/dashboard/employees/${id}`}
        backUrl="/dashboard/empleados"
      />
    </div>
  );
}
