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

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionData = await getSessionData();
    if (!sessionData) {
      console.error("[api/dashboard/clients/[id] GET] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { restaurantId } = sessionData;

    const client = await prisma.client.findFirst({
      where: { id, restaurantId },
      select: {
        id: true,
        dni: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        pin: true,
        points: true,
        visitCount: true,
        active: true,
        createdAt: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (err) {
    console.error("[api/dashboard/clients/[id] GET] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionData = await getSessionData();
    if (!sessionData) {
      console.error("[api/dashboard/clients/[id] PATCH] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { restaurantId, role } = sessionData;

    const existing = await prisma.client.findFirst({
      where: { id, restaurantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, email, pin } = body;
    const canManagePin = role === "ADMIN" || role === "OWNER" || role === "SUPER_ADMIN";

    if (!firstName) {
      return NextResponse.json({ error: "El nombre es requerido." }, { status: 400 });
    }

    const hashedPin = canManagePin && pin !== undefined
      ? (pin ? await hashPin(pin) : null)
      : undefined;

    const updated = await prisma.client.update({
      where: { id },
      data: {
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

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[api/dashboard/clients/[id] PATCH] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sessionData = await getSessionData();
    if (!sessionData) {
      console.error("[api/dashboard/clients/[id] DELETE] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { restaurantId } = sessionData;

    const existing = await prisma.client.findFirst({
      where: { id, restaurantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    await prisma.client.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/dashboard/clients/[id] DELETE] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
