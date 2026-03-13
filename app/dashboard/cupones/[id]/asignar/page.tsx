import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AssignCouponForm from "@/components/dashboard/forms/AssignCouponForm";

export default async function AssignCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  const coupon = await prisma.coupon.findFirst({
    where: { id, restaurantId: me.restaurantId },
    select: { id: true, name: true },
  });
  if (!coupon) redirect("/dashboard/cupones");

  const clients = await prisma.client.findMany({
    where: { restaurantId: me.restaurantId, active: true },
    select: { id: true, firstName: true, lastName: true, dni: true },
    orderBy: { firstName: "asc" },
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Asignar cupón</h1>
      <AssignCouponForm
        couponId={coupon.id}
        couponName={coupon.name}
        clients={clients}
      />
    </div>
  );
}
