import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json({ error: "clientId requerido." }, { status: 400 });
    }

    const product = await prisma.catalogProduct.findUnique({
      where: { id, active: true },
      select: { id: true, name: true, pointCost: true, restaurantId: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado o inactivo." }, { status: 404 });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, restaurantId: product.restaurantId },
      select: { id: true, points: true },
    });
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    if (client.points < product.pointCost) {
      return NextResponse.json(
        { error: `Puntos insuficientes. Tenés ${client.points} pts y el producto cuesta ${product.pointCost} pts.` },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.findFirst({
      where: { restaurantId: product.restaurantId, active: true },
      select: { id: true },
    });
    if (!branch) {
      return NextResponse.json({ error: "El negocio no tiene sucursales activas." }, { status: 400 });
    }

    let redemptionId: string;
    let redemptionCreatedAt: Date;

    await prisma.$transaction(async (tx) => {
      const redemption = await tx.redemption.create({
        data: {
          restaurantId: product.restaurantId,
          branchId: branch.id,
          clientId,
          productId: id,
          pointsSpent: product.pointCost,
          redeemedByClientId: clientId,
        },
      });
      redemptionId = redemption.id;
      redemptionCreatedAt = redemption.createdAt;
      await tx.pointsLedger.create({
        data: {
          restaurantId: product.restaurantId,
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

    return NextResponse.json({
      success: true,
      redemption: {
        id: redemptionId!,
        productName: product.name,
        pointsSpent: product.pointCost,
        createdAt: redemptionCreatedAt!,
      },
    });
  } catch (err) {
    console.error("[api/tienda/catalog/[id]/redeem POST] Unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
