import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, restaurantId: true },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/employees/[id] PATCH] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para editar empleados." }, { status: 403 });
    }

    const { id } = await params;

    const target = await prisma.user.findUnique({
      where: { id },
      select: { role: true, restaurantId: true },
    });

    if (!target || target.restaurantId !== me.restaurantId) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    if (me.role === "ADMIN" && target.role !== "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para editar este usuario." }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role, password } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Nombre, email y rol son requeridos." }, { status: 400 });
    }

    const duplicate = await prisma.user.findFirst({
      where: { email, restaurantId: me.restaurantId, NOT: { id } },
      select: { id: true },
    });
    if (duplicate) {
      return NextResponse.json({ error: "El email ya está en uso por otro usuario." }, { status: 409 });
    }

    const updateData: Record<string, unknown> = { name, email, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/dashboard/employees/[id] PATCH] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/employees/[id] DELETE] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para eliminar empleados." }, { status: 403 });
    }

    const { id } = await params;

    const target = await prisma.user.findUnique({
      where: { id },
      select: { role: true, restaurantId: true },
    });

    if (!target || target.restaurantId !== me.restaurantId) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    // ADMIN cannot delete another ADMIN or OWNER
    if (me.role === "ADMIN" && target.role !== "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para eliminar este usuario." }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/dashboard/employees/[id] DELETE] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
