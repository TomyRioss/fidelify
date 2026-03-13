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
      console.error("[api/dashboard/catalog/[id]/redeem POST] Unauthorized");
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

    const product = await prisma.catalogProduct.findFirst({
      where: { id, restaurantId: me.restaurantId, active: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, restaurantId: me.restaurantId },
      select: { id: true, points: true },
    });
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    if (client.points < product.pointCost) {
      return NextResponse.json({ error: "Puntos insuficientes." }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.redemption.create({
        data: {
          restaurantId: me.restaurantId!,
          branchId: branch.id,
          clientId,
          productId: id,
          pointsSpent: product.pointCost,
          redeemedById: me.id,
        },
      });
      await tx.pointsLedger.create({
        data: {
          restaurantId: me.restaurantId!,
          branchId: branch.id,
          clientId,
          delta: -product.pointCost,
          type: "REDEMPTION",
        },
      });
      await tx.client.update({
        where: { id: clientId },
        data: { points: { decrement: product.pointCost } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/dashboard/catalog/[id]/redeem POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
