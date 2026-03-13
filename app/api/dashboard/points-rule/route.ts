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
      console.error("[api/dashboard/points-rule GET] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { restaurantId } = authData;
    const rule = await prisma.pointsRule.findFirst({
      where: { restaurantId, active: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(rule || null);
  } catch (err) {
    console.error("[api/dashboard/points-rule GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authData = await getRestaurantIdAndRole();
    if (!authData?.restaurantId || !canManageSettings(authData.role)) {
      console.error("[api/dashboard/points-rule POST] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { restaurantId } = authData;
    const body = await request.json();
    const { amountPerPoint, active = true } = body;

    if (amountPerPoint === undefined || amountPerPoint === null) {
      return NextResponse.json({ error: "Monto por punto es requerido" }, { status: 400 });
    }

    const amount = Number(amountPerPoint);
    if (isNaN(amount) || amount < 0.01 || amount > 1000000) {
      return NextResponse.json({ error: "Monto por punto debe ser entre 0.01 y 1,000,000" }, { status: 400 });
    }

    const now = new Date();
    const rule = await prisma.$transaction(async (tx) => {
      if (active) {
        await tx.pointsRule.updateMany({
          where: { restaurantId, active: true },
          data: { active: false },
        });
      }

      return await tx.pointsRule.create({
        data: {
          restaurantId,
          amountPerPoint: amount,
          active,
          createdAt: now,
        },
      });
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (err) {
    console.error("[api/dashboard/points-rule POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
