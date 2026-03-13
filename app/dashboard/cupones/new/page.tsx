import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CouponForm from "@/components/dashboard/forms/CouponForm";

export default async function NewCouponPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Nuevo cupón</h1>
      <CouponForm />
    </div>
  );
}
