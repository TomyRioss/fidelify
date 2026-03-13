import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CouponsTable from "@/components/dashboard/CouponsTable";

export default async function CuponesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { restaurantId: true, role: true },
  });

  if (!user?.restaurantId) redirect("/dashboard");

  const [coupons, clients] = await Promise.all([
    prisma.coupon.findMany({
      where: { restaurantId: user.restaurantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        value: true,
        expiresAt: true,
        createdAt: true,
        _count: { select: { couponAssignments: true } },
      },
    }),
    prisma.client.findMany({
      where: { restaurantId: user.restaurantId, active: true },
      orderBy: { firstName: "asc" },
      select: { id: true, firstName: true, lastName: true, dni: true },
    }),
  ]);

  const serializedCoupons = coupons.map((c) => ({
    ...c,
    value: c.value ? c.value.toString() : null,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Cupones</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {coupons.length} cupón{coupons.length !== 1 ? "es" : ""} registrado{coupons.length !== 1 ? "s" : ""}
        </p>
      </div>
      <CouponsTable
        initialData={serializedCoupons}
        clients={clients}
        callerRole={user.role}
      />
    </div>
  );
}
