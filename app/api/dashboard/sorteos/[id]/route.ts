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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/sorteos/[id] PATCH] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para editar sorteos." }, { status: 403 });
    }

    const existing = await prisma.raffle.findFirst({
      where: { id, restaurantId: me.restaurantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Sorteo no encontrado." }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, prizeFirst, prizeSecond, prizeThird, closingDate, participationType, pointsCost } = body;

    if (participationType && !["FREE", "POINTS_COST"].includes(participationType)) {
      return NextResponse.json({ error: "Tipo de participación inválido." }, { status: 400 });
    }

    const effectiveType = participationType ?? existing.participationType;
    if (effectiveType === "POINTS_COST" && pointsCost !== undefined && pointsCost <= 0) {
      return NextResponse.json({ error: "El costo en puntos debe ser mayor a 0." }, { status: 400 });
    }

    let prizeJson: string | undefined;
    if (prizeFirst !== undefined || prizeSecond !== undefined || prizeThird !== undefined) {
      const currentPrize = (() => {
        try { return JSON.parse(existing.prize); } catch { return {}; }
      })();
      prizeJson = JSON.stringify({
        first: prizeFirst ?? currentPrize.first ?? "",
        second: prizeSecond ?? currentPrize.second ?? null,
        third: prizeThird ?? currentPrize.third ?? null,
      });
    }

    const updated = await prisma.raffle.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
        ...(prizeJson !== undefined && { prize: prizeJson }),
        ...(closingDate !== undefined && { closingDate: new Date(closingDate) }),
        ...(participationType !== undefined && { participationType }),
        ...(pointsCost !== undefined && { pointsCost: effectiveType === "POINTS_COST" ? Number(pointsCost) : null }),
        ...(participationType === "FREE" && { pointsCost: null }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        prize: true,
        closingDate: true,
        participationType: true,
        pointsCost: true,
        executed: true,
        createdAt: true,
        _count: { select: { raffleEntries: true } },
      },
    });

    return NextResponse.json({
      ...updated,
      closingDate: updated.closingDate.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("[api/dashboard/sorteos/[id] PATCH] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/sorteos/[id] DELETE] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para eliminar sorteos." }, { status: 403 });
    }

    const existing = await prisma.raffle.findFirst({
      where: { id, restaurantId: me.restaurantId },
      include: { _count: { select: { raffleEntries: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Sorteo no encontrado." }, { status: 404 });
    }

    if (existing._count.raffleEntries > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un sorteo que ya tiene participantes." },
        { status: 409 }
      );
    }

    await prisma.raffle.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/dashboard/sorteos/[id] DELETE] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
