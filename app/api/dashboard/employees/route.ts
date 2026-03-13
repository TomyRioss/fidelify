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

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/employees GET] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employees = await prisma.user.findMany({
      where: { restaurantId: me.restaurantId, id: { not: me.id } },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    return NextResponse.json({ employees, callerRole: me.role });
  } catch (err) {
    console.error("[api/dashboard/employees GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/employees POST] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "No tenés permisos para crear empleados." }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Nombre, email, contraseña y rol son requeridos." }, { status: 400 });
    }

    // ADMIN can only create EMPLOYEE
    if (me.role === "ADMIN" && role !== "EMPLOYEE") {
      return NextResponse.json({ error: "Solo podés crear empleados." }, { status: 403 });
    }

    // OWNER/SUPER_ADMIN can create ADMIN or EMPLOYEE only
    if ((me.role === "OWNER" || me.role === "SUPER_ADMIN") && !["ADMIN", "EMPLOYEE"].includes(role)) {
      return NextResponse.json({ error: "Rol no permitido." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe un usuario con ese email." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, restaurantId: me.restaurantId },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("[api/dashboard/employees POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
