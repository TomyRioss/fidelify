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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/coupons/[id] PATCH] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para editar cupones." }, { status: 403 });
    }

    const existing = await prisma.coupon.findFirst({
      where: { id, restaurantId: me.restaurantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Cupón no encontrado." }, { status: 404 });
    }

    const body = await request.json();
    const { name, type, value, expiresAt, description } = body;

    if (type && !["PERCENTAGE", "FIXED_AMOUNT"].includes(type)) {
      return NextResponse.json({ error: "Tipo de cupón inválido." }, { status: 400 });
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(value !== undefined && { value }),
        ...(description !== undefined && { description: description || null }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        value: true,
        expiresAt: true,
        createdAt: true,
        _count: { select: { couponAssignments: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[api/dashboard/coupons/[id] PATCH] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/coupons/[id] DELETE] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para eliminar cupones." }, { status: 403 });
    }

    const existing = await prisma.coupon.findFirst({
      where: { id, restaurantId: me.restaurantId },
      include: { _count: { select: { couponAssignments: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Cupón no encontrado." }, { status: 404 });
    }

    if (existing._count.couponAssignments > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un cupón con asignaciones existentes." },
        { status: 409 }
      );
    }

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/dashboard/coupons/[id] DELETE] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
