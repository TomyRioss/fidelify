import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { id: session.user.id },
      select: { restaurantId: true, role: true },
    });

    if (!user?.restaurantId) {
      return NextResponse.json({ error: "No restaurant found" }, { status: 404 });
    }

    const branches = await prisma.branch.findMany({
      where: { restaurantId: user.restaurantId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, address: true, phone: true, active: true, createdAt: true },
    });

    return NextResponse.json(branches);
  } catch (err) {
    console.error("[api/dashboard/branches GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const { name, address, phone } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const branch = await prisma.branch.create({
      data: { restaurantId: user.restaurantId, name, address, phone },
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (err) {
    console.error("[api/dashboard/branches POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
