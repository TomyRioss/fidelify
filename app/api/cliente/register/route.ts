import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { dni, email, password, firstName, lastName, phone } =
      await request.json();

    if (!dni || !email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Todos los campos requeridos son obligatorios." },
        { status: 400 }
      );
    }

    const existingDni = await prisma.clienteGlobal.findUnique({ where: { dni } });
    if (existingDni) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese DNI." },
        { status: 409 }
      );
    }

    const existingEmail = await prisma.clienteGlobal.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.clienteGlobal.create({
      data: {
        dni,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[api/cliente/register]", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
