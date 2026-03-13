import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getSessionData() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { restaurantId: true, role: true },
  });
  if (!user?.restaurantId) return null;
  return { restaurantId: user.restaurantId, role: user.role };
}

export async function POST(request: Request) {
  try {
    const session = await getSessionData();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allowed = ["OWNER", "ADMIN", "SUPER_ADMIN"];
    if (!allowed.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Archivo CSV requerido." }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return NextResponse.json({ error: "El CSV no tiene datos." }, { status: 400 });
    }

    const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
    const nameIdx = header.indexOf("nombre");
    const descIdx = header.indexOf("descripcion");
    const priceIdx = header.indexOf("precio");
    const catIdx = header.indexOf("categoria");

    if (nameIdx === -1 || priceIdx === -1) {
      return NextResponse.json(
        { error: "El CSV debe tener columnas 'nombre' y 'precio'." },
        { status: 400 }
      );
    }

    const dataRows = lines.slice(1);
    const toCreate: {
      restaurantId: string;
      name: string;
      description: string | null;
      price: number;
      category: string | null;
      active: boolean;
    }[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const cols = dataRows[i].split(",").map((c) => c.trim());
      const name = cols[nameIdx];
      const rawPrice = cols[priceIdx];
      const description = descIdx !== -1 ? cols[descIdx] || null : null;
      const category = catIdx !== -1 ? cols[catIdx] || null : null;

      if (!name) {
        errors.push({ row: i + 2, message: "Nombre requerido." });
        continue;
      }

      const price = Number(rawPrice);
      if (isNaN(price) || price <= 0) {
        errors.push({ row: i + 2, message: `Precio inválido: "${rawPrice}".` });
        continue;
      }

      toCreate.push({
        restaurantId: session.restaurantId,
        name,
        description,
        price,
        category,
        active: true,
      });
    }

    let created = 0;
    if (toCreate.length > 0) {
      const result = await prisma.menuItem.createMany({ data: toCreate });
      created = result.count;
    }

    return NextResponse.json({ created, errors });
  } catch (err) {
    console.error("[api/dashboard/menu-items/import POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
