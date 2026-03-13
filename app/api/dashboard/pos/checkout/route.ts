import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculatePointsEarned } from "@/lib/services/points-service";

async function getSessionData() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { restaurantId: true, role: true, id: true },
  });
  if (!user?.restaurantId) return null;
  return { restaurantId: user.restaurantId, role: user.role, userId: user.id };
}

export async function POST(request: Request) {
  try {
    const session = await getSessionData();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, clientId, countAsVisit, branchId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Los ítems son requeridos." }, { status: 400 });
    }
    if (!clientId) {
      return NextResponse.json({ error: "El cliente es requerido." }, { status: 400 });
    }
    if (!branchId) {
      return NextResponse.json({ error: "La sucursal es requerida." }, { status: 400 });
    }

    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const pointsEarned = await calculatePointsEarned(session.restaurantId, total);

    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          restaurantId: session.restaurantId,
          branchId,
          clientId,
          total,
          pointsEarned,
          registeredById: session.userId,
          saleItems: {
            create: items.map((item: { menuItemId: string; name: string; price: number; quantity: number }) => ({
              menuItemId: item.menuItemId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          },
        },
      });

      if (countAsVisit) {
        await tx.visit.create({
          data: {
            restaurantId: session.restaurantId,
            branchId,
            clientId,
            saleId: sale.id,
          },
        });
        await tx.client.update({
          where: { id: clientId },
          data: { visitCount: { increment: 1 } },
        });
      }

      if (pointsEarned > 0) {
        await tx.client.update({
          where: { id: clientId },
          data: { points: { increment: pointsEarned } },
        });
        await tx.pointsLedger.create({
          data: {
            restaurantId: session.restaurantId,
            branchId,
            clientId,
            delta: pointsEarned,
            type: "PURCHASE",
            referenceId: sale.id,
          },
        });
      }

      const updatedClient = await tx.client.findUnique({
        where: { id: clientId },
        select: { points: true },
      });

      return { saleId: sale.id, total, pointsEarned, clientPoints: updatedClient?.points ?? 0 };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[api/dashboard/pos/checkout POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
