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
      console.error("[api/dashboard/catalog GET] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.catalogProduct.findMany({
      where: { restaurantId: me.restaurantId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, description: true, pointCost: true, active: true, imageUrl: true, createdAt: true },
    });

    return NextResponse.json({ products, callerRole: me.role });
  } catch (err) {
    console.error("[api/dashboard/catalog GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/catalog POST] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para crear productos." }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, pointCost, imageUrl, active } = body;

    if (!name || !pointCost) {
      return NextResponse.json({ error: "Nombre y costo en puntos son requeridos." }, { status: 400 });
    }

    const cost = parseInt(pointCost, 10);
    if (isNaN(cost) || cost <= 0) {
      return NextResponse.json({ error: "El costo en puntos debe ser un número mayor a 0." }, { status: 400 });
    }

    const product = await prisma.catalogProduct.create({
      data: {
        name,
        description: description || null,
        pointCost: cost,
        restaurantId: me.restaurantId,
        imageUrl: imageUrl || null,
        active: active !== undefined ? active : true,
      },
      select: { id: true, name: true, description: true, pointCost: true, active: true, imageUrl: true, createdAt: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("[api/dashboard/catalog POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
