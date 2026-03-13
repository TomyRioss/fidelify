import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RaffleForm from "@/components/dashboard/forms/RaffleForm";

function parsePrize(prizeJson: string) {
  try {
    const p = JSON.parse(prizeJson);
    return { first: p.first ?? prizeJson, second: p.second ?? "", third: p.third ?? "" };
  } catch {
    return { first: prizeJson, second: "", third: "" };
  }
}

export default async function EditRafflePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  const raffle = await prisma.raffle.findFirst({
    where: { id, restaurantId: me.restaurantId },
    select: { id: true, name: true, description: true, prize: true, closingDate: true, participationType: true, pointsCost: true },
  });
  if (!raffle) redirect("/dashboard/sorteos");

  const prize = parsePrize(raffle.prize);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Editar sorteo</h1>
      <RaffleForm
        raffleId={raffle.id}
        defaultValues={{
          name: raffle.name,
          description: raffle.description ?? "",
          prizeFirst: prize.first,
          prizeSecond: prize.second,
          prizeThird: prize.third,
          closingDate: raffle.closingDate.toISOString().slice(0, 16),
          participationType: raffle.participationType,
          pointsCost: raffle.pointsCost?.toString() ?? "",
        }}
      />
    </div>
  );
}
