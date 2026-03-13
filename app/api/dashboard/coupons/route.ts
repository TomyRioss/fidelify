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
      console.error("[api/dashboard/coupons GET] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      where: { restaurantId: me.restaurantId },
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json(coupons);
  } catch (err) {
    console.error("[api/dashboard/coupons GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/coupons POST] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para crear cupones." }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, value, expiresAt, description } = body;

    if (!name || !type || value === undefined || value === null) {
      return NextResponse.json({ error: "Nombre, tipo y valor son requeridos." }, { status: 400 });
    }

    if (!["PERCENTAGE", "FIXED_AMOUNT"].includes(type)) {
      return NextResponse.json({ error: "Tipo de cupón inválido." }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        restaurantId: me.restaurantId,
        name,
        type,
        value,
        description: description || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
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

    return NextResponse.json(coupon, { status: 201 });
  } catch (err) {
    console.error("[api/dashboard/coupons POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
