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

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      console.error("[api/admin/restaurants/[id]/branches POST] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: restaurantId } = await params;
    const body = await request.json();
    const { name, address, phone } = body;

    if (!name) {
      return NextResponse.json({ error: "El nombre de la sucursal es requerido" }, { status: 400 });
    }

    const branch = await prisma.branch.create({
      data: { restaurantId, name, address: address || null, phone: phone || null },
      select: { id: true, name: true, address: true, phone: true, active: true },
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (err) {
    console.error("[api/admin/restaurants/[id]/branches POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
