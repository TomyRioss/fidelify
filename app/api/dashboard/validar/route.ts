import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { restaurantId: true },
    });

    if (!me?.restaurantId) {
      return NextResponse.json({ error: "Sin restaurante asociado." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.toUpperCase().trim();

    if (!code || code.length !== 8) {
      return NextResponse.json({ error: "El código debe tener 8 caracteres." }, { status: 400 });
    }

    const redemptions = await prisma.redemption.findMany({
      where: { restaurantId: me.restaurantId },
      select: {
        id: true,
        pointsSpent: true,
        createdAt: true,
        client: { select: { firstName: true, lastName: true, dni: true } },
        product: { select: { name: true } },
      },
    });

    const match = redemptions.find(
      (r) => r.id.slice(0, 8).toUpperCase() === code
    );

    if (!match) {
      return NextResponse.json({ error: "Código no encontrado." }, { status: 404 });
    }

    return NextResponse.json({
      redemption: {
        id: match.id,
        code: match.id.slice(0, 8).toUpperCase(),
        productName: match.product.name,
        pointsSpent: match.pointsSpent,
        createdAt: match.createdAt.toISOString(),
        clientName: `${match.client.firstName} ${match.client.lastName}`,
        clientDni: match.client.dni,
      },
    });
  } catch (err) {
    console.error("[api/dashboard/validar GET] Unexpected error:", err);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
