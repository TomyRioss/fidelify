import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getClienteSession() {
  const session = await auth();
  if (!session?.user) return null;
  if ((session.user as { type?: string }).type !== "cliente") return null;
  return session.user;
}

export async function GET() {
  try {
    const user = await getClienteSession();
    if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const clientes = await prisma.client.findMany({
      where: { clienteGlobalId: user.id },
      include: {
        restaurant: {
          select: { id: true, name: true, slug: true, address: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error("[api/cliente/afiliaciones GET]", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getClienteSession();
    if (!user) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

    const { restaurantId } = await request.json();
    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId requerido." }, { status: 400 });
    }

    const clienteGlobal = await prisma.clienteGlobal.findUnique({
      where: { id: user.id },
    });
    if (!clienteGlobal) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) {
      return NextResponse.json({ error: "Local no encontrado." }, { status: 404 });
    }

    const existing = await prisma.client.findUnique({
      where: { restaurantId_dni: { restaurantId, dni: clienteGlobal.dni } },
    });

    if (existing) {
      if (existing.clienteGlobalId) {
        return NextResponse.json({ error: "Ya estás adherido a este local." }, { status: 409 });
      }
      const updated = await prisma.client.update({
        where: { id: existing.id },
        data: { clienteGlobalId: clienteGlobal.id },
      });
      return NextResponse.json(updated, { status: 200 });
    }

    const newClient = await prisma.client.create({
      data: {
        restaurantId,
        clienteGlobalId: clienteGlobal.id,
        dni: clienteGlobal.dni,
        firstName: clienteGlobal.firstName,
        lastName: clienteGlobal.lastName,
        email: clienteGlobal.email,
        phone: clienteGlobal.phone,
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("[api/cliente/afiliaciones POST]", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
