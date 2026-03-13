import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteConfirm from "@/components/dashboard/forms/DeleteConfirm";

export default async function DeleteGiftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  const gift = await prisma.giftMilestone.findFirst({
    where: { id, restaurantId: me.restaurantId },
    select: { id: true, visitTrigger: true },
  });
  if (!gift) redirect("/dashboard/regalos");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Eliminar regalo</h1>
      <DeleteConfirm
        label="regalo"
        description={`¿Eliminar el hito de ${gift.visitTrigger} visitas?`}
        deleteUrl={`/api/dashboard/gifts/${id}`}
        backUrl="/dashboard/regalos"
      />
    </div>
  );
}
