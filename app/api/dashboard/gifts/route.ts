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

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/gifts GET] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gifts = await prisma.giftMilestone.findMany({
      where: { restaurantId: me.restaurantId },
      orderBy: { visitTrigger: "asc" },
      select: { id: true, visitTrigger: true, giftType: true, description: true, active: true, createdAt: true },
    });

    return NextResponse.json({ gifts, callerRole: me.role });
  } catch (err) {
    console.error("[api/dashboard/gifts GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/gifts POST] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para crear regalos." }, { status: 403 });
    }

    const body = await request.json();
    const { visitTrigger, giftType, description } = body;

    if (!visitTrigger || !giftType || !description) {
      return NextResponse.json({ error: "Visitas, tipo y descripción son requeridos." }, { status: 400 });
    }

    const trigger = parseInt(visitTrigger, 10);
    if (isNaN(trigger) || trigger <= 0) {
      return NextResponse.json({ error: "Las visitas requeridas deben ser un número mayor a 0." }, { status: 400 });
    }

    const gift = await prisma.giftMilestone.create({
      data: { visitTrigger: trigger, giftType, description, restaurantId: me.restaurantId },
      select: { id: true, visitTrigger: true, giftType: true, description: true, active: true, createdAt: true },
    });

    return NextResponse.json(gift, { status: 201 });
  } catch (err) {
    console.error("[api/dashboard/gifts POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
