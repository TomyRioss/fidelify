import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "clientId requerido." }, { status: 400 });
    }

    const redemptions = await prisma.redemption.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        pointsSpent: true,
        createdAt: true,
        product: { select: { name: true } },
      },
    });

    return NextResponse.json({
      redemptions: redemptions.map((r) => ({
        id: r.id,
        productName: r.product.name,
        pointsSpent: r.pointsSpent,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    console.error("[api/tienda/redemptions GET] Unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
