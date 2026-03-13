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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/gifts/[id] PATCH] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para editar regalos." }, { status: 403 });
    }

    const { id } = await params;

    const target = await prisma.giftMilestone.findUnique({
      where: { id },
      select: { restaurantId: true },
    });

    if (!target || target.restaurantId !== me.restaurantId) {
      return NextResponse.json({ error: "Regalo no encontrado." }, { status: 404 });
    }

    const body = await req.json();
    const { visitTrigger, giftType, description, active } = body;

    const updateData: Record<string, unknown> = {};
    if (giftType !== undefined) updateData.giftType = giftType;
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;
    if (visitTrigger !== undefined) {
      const trigger = parseInt(visitTrigger, 10);
      if (isNaN(trigger) || trigger <= 0) {
        return NextResponse.json({ error: "Las visitas requeridas deben ser un número mayor a 0." }, { status: 400 });
      }
      updateData.visitTrigger = trigger;
    }

    await prisma.giftMilestone.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/dashboard/gifts/[id] PATCH] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/gifts/[id] DELETE] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para eliminar regalos." }, { status: 403 });
    }

    const { id } = await params;

    const target = await prisma.giftMilestone.findUnique({
      where: { id },
      select: { restaurantId: true },
    });

    if (!target || target.restaurantId !== me.restaurantId) {
      return NextResponse.json({ error: "Regalo no encontrado." }, { status: 404 });
    }

    await prisma.giftMilestone.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/dashboard/gifts/[id] DELETE] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
