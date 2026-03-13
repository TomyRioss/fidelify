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
      console.error("[api/dashboard/catalog/[id] PATCH] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para editar productos." }, { status: 403 });
    }

    const { id } = await params;

    const target = await prisma.catalogProduct.findUnique({
      where: { id },
      select: { restaurantId: true },
    });

    if (!target || target.restaurantId !== me.restaurantId) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, pointCost, active } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (active !== undefined) updateData.active = active;
    if (pointCost !== undefined) {
      const cost = parseInt(pointCost, 10);
      if (isNaN(cost) || cost <= 0) {
        return NextResponse.json({ error: "El costo en puntos debe ser un número mayor a 0." }, { status: 400 });
      }
      updateData.pointCost = cost;
    }

    await prisma.catalogProduct.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/dashboard/catalog/[id] PATCH] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/catalog/[id] DELETE] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para eliminar productos." }, { status: 403 });
    }

    const { id } = await params;

    const target = await prisma.catalogProduct.findUnique({
      where: { id },
      select: { restaurantId: true },
    });

    if (!target || target.restaurantId !== me.restaurantId) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

    await prisma.catalogProduct.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/dashboard/catalog/[id] DELETE] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
