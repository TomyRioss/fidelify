import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteConfirm from "@/components/dashboard/forms/DeleteConfirm";

export default async function DeleteCouponPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Eliminar cupón</h1>
      <DeleteConfirm
        label="cupón"
        description={`¿Eliminar el cupón "${coupon.name}"?`}
        deleteUrl={`/api/dashboard/coupons/${id}`}
        backUrl="/dashboard/cupones"
      />
    </div>
  );
}
