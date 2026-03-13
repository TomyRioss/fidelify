import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EmployeeForm from "@/components/dashboard/forms/EmployeeForm";

export default async function NewEmployeePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Nuevo empleado</h1>
      <EmployeeForm callerRole={me.role as "OWNER" | "ADMIN" | "EMPLOYEE"} />
    </div>
  );
}
