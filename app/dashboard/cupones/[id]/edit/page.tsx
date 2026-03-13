import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CouponForm from "@/components/dashboard/forms/CouponForm";

export default async function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  const coupon = await prisma.coupon.findFirst({
    where: { id, restaurantId: me.restaurantId },
    select: { id: true, name: true, type: true, value: true, expiresAt: true, description: true },
  });
  if (!coupon) redirect("/dashboard/cupones");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Editar cupón</h1>
      <CouponForm
        couponId={coupon.id}
        defaultValues={{
          name: coupon.name,
          type: coupon.type,
          value: coupon.value?.toString() ?? "",
          expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : "",
          description: coupon.description ?? "",
        }}
      />
    </div>
  );
}
