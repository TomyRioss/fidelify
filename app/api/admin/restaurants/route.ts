import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      console.error("[api/admin/restaurants] No authenticated user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN") {
      console.error("[api/admin/restaurants] User is not SUPER_ADMIN:", session.user.id);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const restaurants = await prisma.restaurant.findMany({
      include: { _count: { select: { branches: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(restaurants);
  } catch (err) {
    console.error("[api/admin/restaurants] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      console.error("[api/admin/restaurants POST] No authenticated user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN") {
      console.error("[api/admin/restaurants POST] User is not SUPER_ADMIN");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, slug, phone, address, subscriptionStatus, adminName, adminEmail, adminPassword } = body;

    if (!name || !email || !slug) {
      return NextResponse.json({ error: "name, email y slug son requeridos" }, { status: 400 });
    }
    if (!adminName || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: "adminName, adminEmail y adminPassword son requeridos" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const restaurant = await prisma.$transaction(async (tx) => {
      const created = await tx.restaurant.create({
        data: { name, email, slug, phone, address, subscriptionStatus: subscriptionStatus ?? "TRIAL" },
        include: { _count: { select: { branches: true } } },
      });
      const branch = await tx.branch.create({
        data: { restaurantId: created.id, name: "Sucursal Principal" },
      });
      const owner = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: "OWNER",
          restaurantId: created.id,
        },
      });
      await tx.userBranch.create({
        data: { userId: owner.id, branchId: branch.id },
      });
      return created;
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (err: unknown) {
    console.error("[api/admin/restaurants POST] Unexpected error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    if (message.includes("Unique constraint") || message.includes("unique")) {
      return NextResponse.json({ error: "El email del administrador ya está en uso." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
