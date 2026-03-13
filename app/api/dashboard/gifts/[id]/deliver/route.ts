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
      console.error("[api/dashboard/gifts/[id]/deliver POST] Unauthorized");
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

    const milestone = await prisma.giftMilestone.findFirst({
      where: { id, restaurantId: me.restaurantId, active: true },
    });
    if (!milestone) {
      return NextResponse.json({ error: "Hito no encontrado." }, { status: 404 });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, restaurantId: me.restaurantId },
      select: { visitCount: true },
    });
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    if (client.visitCount < milestone.visitTrigger) {
      return NextResponse.json({ error: "El cliente no cumple el requisito de visitas." }, { status: 400 });
    }

    const existing = await prisma.giftDelivery.findFirst({
      where: { milestoneId: id, clientId, restaurantId: me.restaurantId },
    });
    if (existing) {
      return NextResponse.json({ error: "El regalo ya fue entregado." }, { status: 400 });
    }

    await prisma.giftDelivery.create({
      data: {
        restaurantId: me.restaurantId,
        branchId: branch.id,
        clientId,
        milestoneId: id,
        delivered: true,
        deliveredAt: new Date(),
        deliveredById: me.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/dashboard/gifts/[id]/deliver POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
