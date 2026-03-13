import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GiftForm from "@/components/dashboard/forms/GiftForm";

export default async function EditGiftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  const gift = await prisma.giftMilestone.findFirst({
    where: { id, restaurantId: me.restaurantId },
    select: { id: true, visitTrigger: true, giftType: true, description: true },
  });
  if (!gift) redirect("/dashboard/regalos");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Editar regalo</h1>
      <GiftForm
        giftId={gift.id}
        defaultValues={{
          visitTrigger: String(gift.visitTrigger),
          giftType: gift.giftType,
          description: gift.description,
        }}
      />
    </div>
  );
}
