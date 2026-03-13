import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, restaurantName, email, password } = body;

    if (name && restaurantName && email && password) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Email ya registrado" }, { status: 400 });
      }

      const slug = restaurantName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await prisma.$transaction(async (tx) => {
        const restaurant = await tx.restaurant.create({
          data: {
            name: restaurantName,
            slug,
            email,
            subscriptionStatus: "TRIAL",
            trialStartsAt: new Date(),
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: "OWNER",
            restaurantId: restaurant.id,
          },
          select: { id: true, name: true, email: true, role: true },
        });

        const branch = await tx.branch.create({
          data: { name: "Sucursal Principal", restaurantId: restaurant.id },
        });

        await tx.userBranch.create({
          data: { userId: user.id, branchId: branch.id },
        });

        return user;
      });

      return NextResponse.json({ user: result });
    }

    const session = await auth();

    if (!session?.user) {
      console.error("[api/admin/auth] No authenticated user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "SUPER_ADMIN") {
      console.error("[api/admin/auth] User is not SUPER_ADMIN:", session.user.id);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/auth] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
