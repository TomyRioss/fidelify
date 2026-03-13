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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const restaurantId = await getRestaurantId();
    if (!restaurantId) {
      console.error("[api/dashboard/clients/[id]/points POST] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.client.findFirst({
      where: { id, restaurantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const body = await request.json();
    const points = Number(body.points);

    if (!points || isNaN(points) || points <= 0) {
      return NextResponse.json({ error: "Los puntos deben ser un número positivo." }, { status: 400 });
    }

    const updated = await prisma.client.update({
      where: { id },
      data: { points: { increment: points } },
      select: { id: true, points: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[api/dashboard/clients/[id]/points POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
