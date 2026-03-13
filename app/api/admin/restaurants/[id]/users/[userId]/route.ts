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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      console.error("[api/admin/restaurants/[id]/users/[userId] PATCH] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json();
    const { name, email, role, password } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: "name, email y role son requeridos" }, { status: 400 });
    }
    if (!["ADMIN", "EMPLOYEE", "OWNER"].includes(role)) {
      return NextResponse.json({ error: "role debe ser ADMIN, EMPLOYEE u OWNER" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { name, email, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    return NextResponse.json(user);
  } catch (err: unknown) {
    console.error("[api/admin/restaurants/[id]/users/[userId] PATCH] Unexpected error:", err);
    const message = err instanceof Error ? err.message : "";
    if (message.includes("Unique constraint") || message.includes("unique")) {
      return NextResponse.json({ error: "El email ya está en uso." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
