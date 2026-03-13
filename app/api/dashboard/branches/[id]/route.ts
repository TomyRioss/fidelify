import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findFirst({
      where: { id: session.user.id },
      select: { restaurantId: true },
    });

    if (!user?.restaurantId) {
      return NextResponse.json({ error: "No restaurant found" }, { status: 404 });
    }

    const branch = await prisma.branch.findFirst({
      where: { id, restaurantId: user.restaurantId },
      select: { id: true, name: true, address: true, phone: true, active: true },
    });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json(branch);
  } catch (err) {
    console.error("[api/dashboard/branches/[id] GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findFirst({
      where: { id: session.user.id },
      select: { restaurantId: true, role: true },
    });

    if (!user?.restaurantId) {
      return NextResponse.json({ error: "No restaurant found" }, { status: 404 });
    }

    if (user.role !== "OWNER" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.branch.findFirst({
      where: { id, restaurantId: user.restaurantId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const { name, address, phone } = await request.json();

    const branch = await prisma.branch.update({
      where: { id },
      data: { name, address, phone },
    });

    return NextResponse.json(branch);
  } catch (err) {
    console.error("[api/dashboard/branches/[id] PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
