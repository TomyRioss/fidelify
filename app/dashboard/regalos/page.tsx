import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import GiftsTable from "@/components/dashboard/GiftsTable";

export default async function RegalosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, restaurantId: true },
  });

  if (!me?.restaurantId) redirect("/dashboard");

  const gifts = await prisma.giftMilestone.findMany({
    where: { restaurantId: me.restaurantId },
    orderBy: { visitTrigger: "asc" },
    select: { id: true, visitTrigger: true, giftType: true, description: true, active: true, createdAt: true },
  });

  const serialized = gifts.map((g) => ({
    ...g,
    createdAt: g.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Regalos por visitas</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Configurá los hitos de visitas para recompensar a tus clientes frecuentes.
        </p>
      </div>
      <GiftsTable
        initialData={serialized}
        callerRole={me.role as "OWNER" | "ADMIN" | "EMPLOYEE"}
      />
    </div>
  );
}
