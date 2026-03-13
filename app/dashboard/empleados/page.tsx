import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import EmployeesTable from "@/components/dashboard/EmployeesTable";

export default async function EmpleadosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, restaurantId: true },
  });

  if (!me?.restaurantId) redirect("/dashboard");

  const employees = await prisma.user.findMany({
    where: { restaurantId: me.restaurantId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });

  const serialized = employees.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Empleados</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Gestioná el equipo de tu negocio.
        </p>
      </div>
      <EmployeesTable
        initialData={serialized}
        callerRole={me.role as "OWNER" | "ADMIN" | "EMPLOYEE"}
      />
    </div>
  );
}
