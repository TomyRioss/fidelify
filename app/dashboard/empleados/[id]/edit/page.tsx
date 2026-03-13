import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EmployeeForm from "@/components/dashboard/forms/EmployeeForm";

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  const emp = await prisma.user.findFirst({
    where: { id, restaurantId: me.restaurantId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!emp) redirect("/dashboard/empleados");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Editar empleado</h1>
      <EmployeeForm
        employeeId={emp.id}
        defaultValues={{ name: emp.name, email: emp.email, role: emp.role }}
        callerRole={me.role as "OWNER" | "ADMIN" | "EMPLOYEE"}
      />
    </div>
  );
}
