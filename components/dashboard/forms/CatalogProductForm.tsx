"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  productId?: string;
  defaultValues?: {
    name?: string;
    description?: string;
    pointCost?: string;
  };
};

export default function CatalogProductForm({ productId, defaultValues }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: defaultValues?.name ?? "",
    description: defaultValues?.description ?? "",
    pointCost: defaultValues?.pointCost ?? "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.name || !form.pointCost) {
      toast.error("Nombre y costo en puntos son requeridos.");
      return;
    }
    const cost = parseInt(form.pointCost, 10);
    if (isNaN(cost) || cost <= 0) {
      toast.error("El costo en puntos debe ser un número mayor a 0.");
      return;
    }
    setLoading(true);
    try {
      const payload = { name: form.name, description: form.description || null, pointCost: cost };
      if (productId) {
        const res = await fetch(`/api/dashboard/catalog/${productId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al actualizar el producto.");
        }
      } else {
        const res = await fetch("/api/dashboard/catalog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al crear el producto.");
        }
      }
      router.push("/dashboard/puntos");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[CatalogProductForm] handleSubmit error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-neutral-200 bg-white p-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Café gratis"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Descripción opcional"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pointCost">Costo en puntos *</Label>
        <Input
          id="pointCost"
          type="number"
          min="1"
          value={form.pointCost}
          onChange={(e) => setForm((f) => ({ ...f, pointCost: e.target.value }))}
          placeholder="100"
          className="text-neutral-900"
        />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="outline"
          className="border-neutral-300 text-neutral-700"
          onClick={() => router.push("/dashboard/puntos")}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          className="bg-neutral-900 text-white hover:bg-neutral-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Guardando..." : productId ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </div>
  );
}
