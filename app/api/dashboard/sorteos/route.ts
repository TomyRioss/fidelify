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

export async function GET(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/sorteos GET] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    const raffles = await prisma.raffle.findMany({
      where: { restaurantId: me.restaurantId },
      orderBy: { createdAt: "desc" },
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

    let result = raffles.map((r) => ({
      ...r,
      closingDate: r.closingDate.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }));

    if (clientId) {
      const entries = await prisma.raffleEntry.findMany({
        where: { clientId, raffleId: { in: raffles.map((r) => r.id) } },
        select: { raffleId: true },
      });
      const enteredIds = new Set(entries.map((e) => e.raffleId));
      result = result.map((r) => ({ ...r, alreadyEntered: enteredIds.has(r.id) }));
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/dashboard/sorteos GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/sorteos POST] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para crear sorteos." }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, prizeFirst, prizeSecond, prizeThird, closingDate, participationType, pointsCost } = body;

    if (!name || !prizeFirst || !closingDate || !participationType) {
      return NextResponse.json({ error: "Nombre, primer premio, fecha de cierre y tipo de participación son requeridos." }, { status: 400 });
    }

    if (!["FREE", "POINTS_COST"].includes(participationType)) {
      return NextResponse.json({ error: "Tipo de participación inválido." }, { status: 400 });
    }

    if (participationType === "POINTS_COST" && (!pointsCost || pointsCost <= 0)) {
      return NextResponse.json({ error: "El costo en puntos es requerido para sorteos con costo." }, { status: 400 });
    }

    const prizeJson = JSON.stringify({
      first: prizeFirst,
      second: prizeSecond || null,
      third: prizeThird || null,
    });

    const raffle = await prisma.raffle.create({
      data: {
        restaurantId: me.restaurantId,
        name,
        description: description || null,
        prize: prizeJson,
        closingDate: new Date(closingDate),
        participationType,
        pointsCost: participationType === "POINTS_COST" ? Number(pointsCost) : null,
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

    return NextResponse.json(
      { ...raffle, closingDate: raffle.closingDate.toISOString(), createdAt: raffle.createdAt.toISOString() },
      { status: 201 }
    );
  } catch (err) {
    console.error("[api/dashboard/sorteos POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
