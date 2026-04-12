import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { type?: string }).type !== "cliente") {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const clienteGlobal = await prisma.clienteGlobal.findUnique({
      where: { id: session.user.id },
      select: { dni: true },
    });
    if (!clienteGlobal) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const restaurants = await prisma.restaurant.findMany({
      where: {
        clients: {
          none: { clienteGlobalId: session.user.id },
        },
      },
      select: { id: true, name: true, slug: true, address: true, phone: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(restaurants);
  } catch (error) {
    console.error("[api/cliente/restaurants GET]", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
