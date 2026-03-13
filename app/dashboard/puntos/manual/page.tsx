import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ManualPointsForm from "@/components/dashboard/ManualPointsForm";

export default async function ManualPointsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { restaurantId: true },
  });

  if (!user?.restaurantId) redirect("/dashboard");

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="px-6 pt-6">
        <h1 className="text-xl font-bold text-neutral-900">Sumar puntos</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Buscá un cliente por DNI para sumarle puntos manualmente.
        </p>
      </div>
      <div className="px-6 pb-6">
        <ManualPointsForm />
      </div>
    </div>
  );
}
