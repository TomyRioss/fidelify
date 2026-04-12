import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculatePointsEarned } from "@/lib/services/points-service";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { restaurantId: true, id: true },
    });
    if (!user?.restaurantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { dni, amount, branchId } = body;

    if (!dni || typeof dni !== "string" || !dni.trim()) {
      return NextResponse.json({ error: "El DNI es requerido." }, { status: 400 });
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "El monto debe ser un número positivo." }, { status: 400 });
    }
    if (!branchId) {
      return NextResponse.json({ error: "La sucursal es requerida." }, { status: 400 });
    }

    const restaurantId = user.restaurantId as string;
    const client = await prisma.client.findUnique({
      where: { restaurantId_dni: { restaurantId, dni: dni.trim() } },
      select: { id: true, firstName: true, lastName: true, points: true },
    });
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado con ese DNI." }, { status: 404 });
    }

    const total = Number(amount);
    const pointsEarned = await calculatePointsEarned(restaurantId, total);

    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          restaurantId,
          branchId,
          clientId: client.id,
          total,
          pointsEarned,
          registeredById: user.id,
        },
      });

      if (pointsEarned > 0) {
        await tx.client.update({
          where: { id: client.id },
          data: { points: { increment: pointsEarned } },
        });
        await tx.pointsLedger.create({
          data: {
            restaurantId,
            branchId,
            clientId: client.id,
            delta: pointsEarned,
            type: "PURCHASE",
            referenceId: sale.id,
          },
        });
      }

      const updatedClient = await tx.client.findUnique({
        where: { id: client.id },
        select: { points: true },
      });

      return {
        saleId: sale.id,
        total,
        pointsEarned,
        clientPoints: updatedClient?.points ?? 0,
        clientName: `${client.firstName} ${client.lastName}`,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[api/dashboard/sales/register POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
