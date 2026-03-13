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
      console.error("[api/dashboard/stats GET] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [earnedAgg, spentAgg, totalClients, prevEarnedAgg, prevSpentAgg, prevClients] =
      await Promise.all([
        prisma.pointsLedger.aggregate({
          where: { restaurantId: me.restaurantId, delta: { gt: 0 } },
          _sum: { delta: true },
        }),
        prisma.pointsLedger.aggregate({
          where: { restaurantId: me.restaurantId, delta: { lt: 0 } },
          _sum: { delta: true },
        }),
        prisma.client.count({ where: { restaurantId: me.restaurantId } }),
        prisma.pointsLedger.aggregate({
          where: {
            restaurantId: me.restaurantId,
            delta: { gt: 0 },
            createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth },
          },
          _sum: { delta: true },
        }),
        prisma.pointsLedger.aggregate({
          where: {
            restaurantId: me.restaurantId,
            delta: { lt: 0 },
            createdAt: { gte: startOfPrevMonth, lte: endOfPrevMonth },
          },
          _sum: { delta: true },
        }),
        prisma.client.count({
          where: { restaurantId: me.restaurantId, createdAt: { lte: endOfPrevMonth } },
        }),
      ]);

    const thisMonthEarnedAgg = await prisma.pointsLedger.aggregate({
      where: {
        restaurantId: me.restaurantId,
        delta: { gt: 0 },
        createdAt: { gte: startOfThisMonth },
      },
      _sum: { delta: true },
    });

    const thisMonthSpentAgg = await prisma.pointsLedger.aggregate({
      where: {
        restaurantId: me.restaurantId,
        delta: { lt: 0 },
        createdAt: { gte: startOfThisMonth },
      },
      _sum: { delta: true },
    });

    const thisMonthClients = await prisma.client.count({
      where: { restaurantId: me.restaurantId, createdAt: { gte: startOfThisMonth } },
    });

    return NextResponse.json({
      totalEarned: earnedAgg._sum.delta ?? 0,
      totalSpent: Math.abs(spentAgg._sum.delta ?? 0),
      totalClients,
      prevMonthEarned: prevEarnedAgg._sum.delta ?? 0,
      prevMonthSpent: Math.abs(prevSpentAgg._sum.delta ?? 0),
      prevMonthClients: prevClients,
      thisMonthEarned: thisMonthEarnedAgg._sum.delta ?? 0,
      thisMonthSpent: Math.abs(thisMonthSpentAgg._sum.delta ?? 0),
      thisMonthClients,
    });
  } catch (err) {
    console.error("[api/dashboard/stats GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
