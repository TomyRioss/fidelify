import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ClientsTable from "@/components/dashboard/ClientsTable";

export default async function ClientesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { restaurantId: true },
  });

  if (!user?.restaurantId) redirect("/dashboard");

  const clients = await prisma.client.findMany({
    where: { restaurantId: user.restaurantId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      dni: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      points: true,
      visitCount: true,
      active: true,
      createdAt: true,
    },
  });

  const serialized = clients.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Clientes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {clients.length} cliente{clients.length !== 1 ? "s" : ""} registrado{clients.length !== 1 ? "s" : ""}
        </p>
      </div>
      <ClientsTable initialData={serialized} />
    </div>
  );
}
