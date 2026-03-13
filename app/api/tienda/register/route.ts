import { NextResponse } from "next/server";
import { getRestaurantBySlug, hashPin } from "@/lib/services/tienda-service";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { negocio, dni, firstName, lastName, pin } = body;

    if (!negocio || !dni || !firstName || !pin) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ error: "El PIN debe tener entre 4 y 6 dígitos" }, { status: 400 });
    }

    const restaurant = await getRestaurantBySlug(negocio);
    if (!restaurant) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    const existing = await prisma.client.findUnique({
      where: { restaurantId_dni: { restaurantId: restaurant.id, dni } },
    });

    if (existing) {
      return NextResponse.json({ error: "Ya existe un cliente con ese DNI" }, { status: 409 });
    }

    const hashedPin = await hashPin(pin);

    const client = await prisma.client.create({
      data: {
        restaurantId: restaurant.id,
        dni,
        firstName,
        lastName: lastName || "",
        pin: hashedPin,
      },
      select: {
        id: true,
        dni: true,
        firstName: true,
        lastName: true,
        points: true,
        visitCount: true,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (err) {
    console.error("[api/tienda/register] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
