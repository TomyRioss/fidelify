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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/gifts/client/[clientId] GET] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;

    const [milestones, deliveries, client] = await Promise.all([
      prisma.giftMilestone.findMany({
        where: { restaurantId: me.restaurantId, active: true },
        orderBy: { visitTrigger: "asc" },
      }),
      prisma.giftDelivery.findMany({
        where: { restaurantId: me.restaurantId, clientId },
        select: { milestoneId: true },
      }),
      prisma.client.findFirst({
        where: { id: clientId, restaurantId: me.restaurantId },
        select: { visitCount: true },
      }),
    ]);

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const deliveredMilestoneIds = new Set(deliveries.map((d) => d.milestoneId));

    const result = milestones.map((m) => ({
      id: m.id,
      visitTrigger: m.visitTrigger,
      giftType: m.giftType,
      description: m.description,
      eligible: client.visitCount >= m.visitTrigger,
      delivered: deliveredMilestoneIds.has(m.id),
    }));

    return NextResponse.json({ milestones: result, visitCount: client.visitCount });
  } catch (err) {
    console.error("[api/dashboard/gifts/client/[clientId] GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
