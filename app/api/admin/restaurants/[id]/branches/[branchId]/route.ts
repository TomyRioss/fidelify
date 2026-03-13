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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; branchId: string }> }) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      console.error("[api/admin/restaurants/[id]/branches/[branchId] PATCH] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { branchId } = await params;
    const body = await request.json();
    const { name, address, phone, active } = body;

    const branch = await prisma.branch.update({
      where: { id: branchId },
      data: { name, address: address || null, phone: phone || null, active },
      select: { id: true, name: true, address: true, phone: true, active: true },
    });

    return NextResponse.json(branch);
  } catch (err) {
    console.error("[api/admin/restaurants/[id]/branches/[branchId] PATCH] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; branchId: string }> }) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      console.error("[api/admin/restaurants/[id]/branches/[branchId] DELETE] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { branchId } = await params;
    await prisma.branch.delete({ where: { id: branchId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/admin/restaurants/[id]/branches/[branchId] DELETE] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
