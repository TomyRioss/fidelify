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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authData = await getRestaurantIdAndRole();
    if (!authData?.restaurantId || !canManageSettings(authData.role)) {
      console.error("[api/dashboard/points-rule/[id] PATCH] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { restaurantId } = authData;

    const existingRule = await prisma.pointsRule.findUnique({
      where: { id },
    });

    if (!existingRule || existingRule.restaurantId !== restaurantId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const { amountPerPoint, active } = body;

    const updateData: { amountPerPoint?: number; active?: boolean } = {};

    if (amountPerPoint !== undefined && amountPerPoint !== null) {
      const amount = Number(amountPerPoint);
      if (isNaN(amount) || amount < 0.01 || amount > 1000000) {
        return NextResponse.json({ error: "Monto por punto debe ser entre 0.01 y 1,000,000" }, { status: 400 });
      }
      updateData.amountPerPoint = amount;
    }

    if (active !== undefined && active !== null) {
      if (active && !existingRule.active) {
        await prisma.pointsRule.updateMany({
          where: { restaurantId, active: true, id: { not: id } },
          data: { active: false },
        });
      }
      updateData.active = active;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 });
    }

    const rule = await prisma.pointsRule.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(rule);
  } catch (err) {
    console.error("[api/dashboard/points-rule/[id] PATCH] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
