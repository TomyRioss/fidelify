import { prisma } from "@/lib/prisma";

export async function getUserRestaurantName(userId: string): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: { restaurant: { select: { name: true } } },
  });
  return user?.restaurant?.name ?? null;
}

export async function getUserBranches(
  userId: string
): Promise<{ id: string; name: string }[]> {
  const user = await prisma.user.findFirst({
    where: { id: userId },
    select: {
      userBranches: {
        select: {
          branch: {
            select: { id: true, name: true },
          },
        },
        where: {
          branch: { active: true },
        },
      },
    },
  });

  if (!user) return [];

  return user.userBranches.map((ub) => ub.branch);
}
