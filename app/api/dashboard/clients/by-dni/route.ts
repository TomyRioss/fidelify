import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getRestaurantId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { restaurantId: true },
  });
  return user?.restaurantId ?? null;
}

export async function GET(request: Request) {
  try {
    const restaurantId = await getRestaurantId();
    if (!restaurantId) {
      console.error("[api/dashboard/clients/by-dni GET] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dni = searchParams.get("dni");

    if (!dni) {
      return NextResponse.json({ error: "El DNI es requerido." }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { restaurantId_dni: { restaurantId, dni } },
      select: { id: true, firstName: true, lastName: true, points: true, visitCount: true, active: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (err) {
    console.error("[api/dashboard/clients/by-dni GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
