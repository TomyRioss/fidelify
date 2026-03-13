import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getRestaurantIdAndRole(): Promise<{ restaurantId: string | null; role: string | null } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { restaurantId: true, role: true },
  });
  return user ? { restaurantId: user.restaurantId, role: user.role } : null;
}

function canManageSettings(role: string | null): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function GET() {
  try {
    const authData = await getRestaurantIdAndRole();
    if (!authData?.restaurantId) {
      console.error("[api/dashboard/restaurant-settings GET] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { restaurantId } = authData;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
      },
    });

    if (!restaurant) {
      console.error("[api/dashboard/restaurant-settings GET] Restaurant not found:", restaurantId);
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(restaurant);
  } catch (err) {
    console.error("[api/dashboard/restaurant-settings GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authData = await getRestaurantIdAndRole();
    if (!authData?.restaurantId || !canManageSettings(authData.role)) {
      console.error("[api/dashboard/restaurant-settings PATCH] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { restaurantId } = authData;
    const body = await request.json();
    const { name, phone, address } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Nombre es requerido" }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
      },
    });

    return NextResponse.json(restaurant);
  } catch (err) {
    console.error("[api/dashboard/restaurant-settings PATCH] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
