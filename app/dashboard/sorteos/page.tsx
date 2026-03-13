import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import RafflesTable from "@/components/dashboard/RafflesTable";

export default async function SorteosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { restaurantId: true, role: true },
  });

  if (!user?.restaurantId) redirect("/dashboard");

  if (user.role === "EMPLOYEE") redirect("/dashboard");

  const raffles = await prisma.raffle.findMany({
    where: { restaurantId: user.restaurantId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      prize: true,
      closingDate: true,
      participationType: true,
      pointsCost: true,
      executed: true,
      createdAt: true,
      _count: { select: { raffleEntries: true } },
    },
  });

  const serialized = raffles.map((r) => ({
    ...r,
    closingDate: r.closingDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Sorteos</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {raffles.length} sorteo{raffles.length !== 1 ? "s" : ""} registrado{raffles.length !== 1 ? "s" : ""}
        </p>
      </div>
      <RafflesTable initialData={serialized} callerRole={user.role} />
    </div>
  );
}
