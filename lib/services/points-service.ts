import { prisma } from "@/lib/prisma";
import type { PointsLedgerType } from "@prisma/client";

export async function getActivePointsRule(restaurantId: string) {
  return await prisma.pointsRule.findFirst({
    where: { restaurantId, active: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function calculatePointsEarned(restaurantId: string, totalAmount: number) {
  const rule = await getActivePointsRule(restaurantId);
  if (!rule || !rule.active) {
    return 0;
  }
  const amountPerPoint = Number(rule.amountPerPoint);
  if (amountPerPoint <= 0) {
    return 0;
  }
  return Math.floor(totalAmount / amountPerPoint);
}

export async function registerPurchasePoints(
  restaurantId: string,
  branchId: string,
  clientId: string,
  saleId: string,
  totalAmount: number
) {
  const pointsEarned = await calculatePointsEarned(restaurantId, totalAmount);
  if (pointsEarned <= 0) {
    return { pointsEarned: 0 };
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.client.update({
      where: { id: clientId },
      data: { points: { increment: pointsEarned } },
    }),
    prisma.pointsLedger.create({
      data: {
        restaurantId,
        branchId,
        clientId,
        delta: pointsEarned,
        type: "PURCHASE" as PointsLedgerType,
        referenceId: saleId,
        createdAt: now,
      },
    }),
  ]);

  return { pointsEarned };
}
