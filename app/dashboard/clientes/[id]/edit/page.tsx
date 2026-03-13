import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClientForm from "@/components/dashboard/forms/ClientForm";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  const canManagePin = me.role === "ADMIN" || me.role === "OWNER";

  const client = await prisma.client.findFirst({
    where: { id, restaurantId: me.restaurantId },
    select: { id: true, dni: true, firstName: true, lastName: true, phone: true, email: true, pin: true },
  });
  if (!client) redirect("/dashboard/clientes");

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full max-w-lg">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Editar cliente</h1>
      <ClientForm
        clientId={client.id}
        canManagePin={canManagePin}
        defaultValues={{
          dni: client.dni,
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone ?? "",
          email: client.email ?? "",
          pin: client.pin ?? "",
        }}
      />
      </div>
    </div>
  );
}
