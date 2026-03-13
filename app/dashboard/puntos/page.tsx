import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CatalogTable from "@/components/dashboard/CatalogTable";

export default async function PuntosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, restaurantId: true },
  });

  if (!me?.restaurantId) redirect("/dashboard");

  const products = await prisma.catalogProduct.findMany({
    where: { restaurantId: me.restaurantId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, description: true, pointCost: true, active: true, createdAt: true },
  });

  const serialized = products.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Tienda de puntos</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Gestioná los productos que los clientes pueden canjear con sus puntos.
        </p>
      </div>
      <CatalogTable
        initialData={serialized}
        callerRole={me.role as "OWNER" | "ADMIN" | "EMPLOYEE"}
      />
    </div>
  );
}
