import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getSessionData() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { restaurantId: true, role: true, id: true },
  });
  if (!user?.restaurantId) return null;
  return { restaurantId: user.restaurantId, role: user.role, userId: user.id };
}

export async function GET() {
  try {
    const session = await getSessionData();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.menuItem.findMany({
      where: { restaurantId: session.restaurantId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("[api/dashboard/menu-items GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionData();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowed = ["OWNER", "ADMIN", "SUPER_ADMIN"];
    if (!allowed.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, category, active } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ error: "Nombre y precio son requeridos." }, { status: 400 });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json({ error: "El precio debe ser un número mayor a 0." }, { status: 400 });
    }

    const item = await prisma.menuItem.create({
      data: {
        restaurantId: session.restaurantId,
        name,
        description: description || null,
        price: numPrice,
        category: category || null,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("[api/dashboard/menu-items POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
