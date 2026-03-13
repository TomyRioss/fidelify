import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as { role?: string }).role;
  if (role !== "SUPER_ADMIN") return null;
  return session;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      console.error("[api/admin/restaurants/[id]/users POST] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "name, email, password y role son requeridos" }, { status: 400 });
    }
    if (!["ADMIN", "EMPLOYEE", "OWNER"].includes(role)) {
      return NextResponse.json({ error: "role debe ser ADMIN, EMPLOYEE u OWNER" }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, restaurantId: id },
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err: unknown) {
    console.error("[api/admin/restaurants/[id]/users POST] Unexpected error:", err);
    const message = err instanceof Error ? err.message : "";
    if (message.includes("Unique constraint") || message.includes("unique")) {
      return NextResponse.json({ error: "El email ya está en uso." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
