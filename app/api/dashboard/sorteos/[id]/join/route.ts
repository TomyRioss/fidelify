import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, restaurantId: true },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/sorteos/[id]/join POST] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json({ error: "clientId requerido." }, { status: 400 });
    }

    const branch = await prisma.branch.findFirst({
      where: { restaurantId: me.restaurantId, active: true },
      select: { id: true },
    });
    if (!branch) {
      return NextResponse.json({ error: "Sin sucursales configuradas." }, { status: 400 });
    }

    const raffle = await prisma.raffle.findFirst({
      where: { id, restaurantId: me.restaurantId, executed: false },
    });
    if (!raffle) {
      return NextResponse.json({ error: "Sorteo no encontrado o ya ejecutado." }, { status: 404 });
    }

    if (new Date(raffle.closingDate) < new Date()) {
      return NextResponse.json({ error: "El sorteo ya cerró." }, { status: 400 });
    }

    const existing = await prisma.raffleEntry.findUnique({
      where: { raffleId_clientId: { raffleId: id, clientId } },
    });
    if (existing) {
      return NextResponse.json({ error: "El cliente ya participa en este sorteo." }, { status: 400 });
    }

    if (raffle.participationType === "POINTS_COST" && raffle.pointsCost) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, restaurantId: me.restaurantId },
        select: { points: true },
      });
      if (!client) {
        return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
      }
      if (client.points < raffle.pointsCost) {
        return NextResponse.json({ error: "Puntos insuficientes para participar." }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.pointsLedger.create({
          data: {
            restaurantId: me.restaurantId!,
            branchId: branch.id,
            clientId,
            delta: -raffle.pointsCost!,
            type: "RAFFLE_COST",
            referenceId: id,
          },
        });
        await tx.client.update({
          where: { id: clientId },
          data: { points: { decrement: raffle.pointsCost! } },
        });
        await tx.raffleEntry.create({
          data: {
            restaurantId: me.restaurantId!,
            branchId: branch.id,
            clientId,
            raffleId: id,
          },
        });
      });
    } else {
      await prisma.raffleEntry.create({
        data: {
          restaurantId: me.restaurantId,
          branchId: branch.id,
          clientId,
          raffleId: id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/dashboard/sorteos/[id]/join POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
