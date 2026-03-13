import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientForm from "@/components/dashboard/forms/ClientForm";

export default async function NewClientPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  const canManagePin = me.role === "ADMIN" || me.role === "OWNER";

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Nuevo cliente</h1>
      <ClientForm canManagePin={canManagePin} />
    </div>
  );
}
