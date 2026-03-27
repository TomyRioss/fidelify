import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPin } from "@/lib/services/tienda-service";

async function getSessionData(): Promise<{ restaurantId: string; role: string } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { restaurantId: true, role: true },
  });
  if (!user?.restaurantId) return null;
  return { restaurantId: user.restaurantId, role: user.role };
}

export async function GET() {
  try {
    const sessionData = await getSessionData();
    if (!sessionData) {
      console.error("[api/dashboard/clients GET] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { restaurantId } = sessionData;

    const clients = await prisma.client.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        dni: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        points: true,
        visitCount: true,
        active: true,
        createdAt: true,
      },
    });

    return NextResponse.json(clients);
  } catch (err) {
    console.error("[api/dashboard/clients GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionData = await getSessionData();
    if (!sessionData) {
      console.error("[api/dashboard/clients POST] Unauthorized or no restaurantId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { restaurantId, role } = sessionData;

    const body = await request.json();
    const { dni, firstName, lastName, phone, email, pin } = body;
    const canManagePin = role === "ADMIN" || role === "OWNER" || role === "SUPER_ADMIN";

    if (!dni || !firstName) {
      return NextResponse.json({ error: "DNI y nombre son requeridos." }, { status: 400 });
    }

    const existing = await prisma.client.findUnique({
      where: { restaurantId_dni: { restaurantId, dni } },
    });
    if (existing) {
      return NextResponse.json({ error: "Ya existe un cliente con ese DNI." }, { status: 409 });
    }

    const hashedPin = canManagePin && pin ? await hashPin(pin) : undefined;

    const client = await prisma.client.create({
      data: {
        restaurantId,
        dni,
        firstName,
        lastName: lastName || "",
        phone: phone || null,
        email: email || null,
        ...(hashedPin !== undefined ? { pin: hashedPin } : {}),
      },
      select: {
        id: true,
        dni: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        points: true,
        visitCount: true,
        active: true,
        createdAt: true,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (err) {
    console.error("[api/dashboard/clients POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
