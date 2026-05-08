import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, restaurantId: true },
  });
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me?.restaurantId) {
      console.error("[api/dashboard/upload POST] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (me.role === "EMPLOYEE") {
      return NextResponse.json({ error: "Sin permisos para subir archivos." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Archivo requerido." }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const originalName = file instanceof File ? file.name : "upload";
    const ext = originalName.split(".").pop();
    const path = `${me.restaurantId}/${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error } = await supabase.storage
      .from("catalog-images")
      .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("[api/dashboard/upload POST] Supabase upload error:", error);
      return NextResponse.json({ error: "Error al subir la imagen." }, { status: 500 });
    }

    const { data } = supabase.storage.from("catalog-images").getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl }, { status: 201 });
  } catch (err) {
    console.error("[api/dashboard/upload POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
