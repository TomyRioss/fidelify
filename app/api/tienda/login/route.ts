import { NextResponse } from "next/server";
import { getRestaurantBySlug, getClientByDniAndPin } from "@/lib/services/tienda-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { negocio, dni, pin } = body;

    if (!negocio || !dni || !pin) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    const restaurant = await getRestaurantBySlug(negocio);
    if (!restaurant) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    const client = await getClientByDniAndPin(restaurant.id, dni, pin);
    if (!client) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    if (!client.active) {
      return NextResponse.json({ error: "Cuenta desactivada" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      clientId: client.id,
      client: {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        dni: client.dni,
        points: client.points,
        visitCount: client.visitCount,
      },
    });
  } catch (err) {
    console.error("[api/tienda/login] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
