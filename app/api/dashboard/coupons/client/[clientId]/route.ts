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
      console.error("[api/dashboard/coupons/client/[clientId] GET] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;

    const assignments = await prisma.couponAssignment.findMany({
      where: { clientId, restaurantId: me.restaurantId, used: false },
      include: { coupon: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (err) {
    console.error("[api/dashboard/coupons/client/[clientId] GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
