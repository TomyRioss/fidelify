import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RaffleForm from "@/components/dashboard/forms/RaffleForm";

export default async function NewRafflePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Nuevo sorteo</h1>
      <RaffleForm />
    </div>
  );
}
