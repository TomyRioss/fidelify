import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  if (role !== "SUPER_ADMIN") return null;
  return session;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      console.error("[api/admin/restaurants/[id] GET] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true, active: true } },
        branches: { select: { id: true, name: true, address: true, phone: true, active: true }, orderBy: { createdAt: "asc" } },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const ownerUser = restaurant.users.find((u) => u.role === "OWNER") ?? null;
    const teamUsers = restaurant.users.filter((u) => u.role !== "OWNER");
    const usersCount = restaurant.users.length;

    return NextResponse.json({ ownerUser, teamUsers, usersCount, branches: restaurant.branches });
  } catch (err) {
    console.error("[api/admin/restaurants/[id] GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      console.error("[api/admin/restaurants/[id] PATCH] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, slug, phone, address, subscriptionStatus } = body;

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: { name, email, slug, phone, address, subscriptionStatus },
      include: { _count: { select: { branches: true } } },
    });

    return NextResponse.json(restaurant);
  } catch (err) {
    console.error("[api/admin/restaurants/[id] PATCH] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      console.error("[api/admin/restaurants/[id] DELETE] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.restaurant.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/restaurants/[id] DELETE] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
