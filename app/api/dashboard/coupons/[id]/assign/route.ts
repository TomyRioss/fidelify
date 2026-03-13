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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/coupons/[id]/assign POST] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para asignar cupones." }, { status: 403 });
    }

    const body = await request.json();
    const { clientId, branchId } = body;

    if (!clientId || !branchId) {
      return NextResponse.json({ error: "clientId y branchId son requeridos." }, { status: 400 });
    }

    const coupon = await prisma.coupon.findFirst({
      where: { id, restaurantId: me.restaurantId },
    });
    if (!coupon) {
      return NextResponse.json({ error: "Cupón no encontrado." }, { status: 404 });
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, restaurantId: me.restaurantId },
    });
    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const branch = await prisma.branch.findFirst({
      where: { id: branchId, restaurantId: me.restaurantId },
    });
    if (!branch) {
      return NextResponse.json({ error: "Sucursal no encontrada." }, { status: 404 });
    }

    const assignment = await prisma.couponAssignment.create({
      data: {
        restaurantId: me.restaurantId,
        branchId,
        clientId,
        couponId: id,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (err) {
    console.error("[api/dashboard/coupons/[id]/assign POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
