"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GIFT_TYPES = [
  { value: "FREE_PRODUCT", label: "Producto gratis" },
  { value: "DISCOUNT", label: "Descuento" },
  { value: "COUPON", label: "Cupón" },
  { value: "CUSTOM", label: "Personalizado" },
];

type Props = {
  giftId?: string;
  defaultValues?: {
    visitTrigger?: string;
    giftType?: string;
    description?: string;
  };
};

export default function GiftForm({ giftId, defaultValues }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    visitTrigger: defaultValues?.visitTrigger ?? "",
    giftType: defaultValues?.giftType ?? "FREE_PRODUCT",
    description: defaultValues?.description ?? "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.visitTrigger || !form.description) {
      toast.error("Visitas requeridas y descripción son obligatorias.");
      return;
    }
    const trigger = parseInt(form.visitTrigger, 10);
    if (isNaN(trigger) || trigger <= 0) {
      toast.error("Las visitas requeridas deben ser un número mayor a 0.");
      return;
    }
    setLoading(true);
    try {
      const payload = { visitTrigger: trigger, giftType: form.giftType, description: form.description };
      if (giftId) {
        const res = await fetch(`/api/dashboard/gifts/${giftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al actualizar el regalo.");
        }
      } else {
        const res = await fetch("/api/dashboard/gifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al crear el regalo.");
        }
      }
      router.push("/dashboard/regalos");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[GiftForm] handleSubmit error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-neutral-200 bg-white p-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="visitTrigger">Visitas requeridas *</Label>
        <Input
          id="visitTrigger"
          type="number"
          min="1"
          value={form.visitTrigger}
          onChange={(e) => setForm((f) => ({ ...f, visitTrigger: e.target.value }))}
          placeholder="5"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="giftType">Tipo *</Label>
        <select
          id="giftType"
          value={form.giftType}
          onChange={(e) => setForm((f) => ({ ...f, giftType: e.target.value }))}
          className="h-9 w-full border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
        >
          {GIFT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descripción *</Label>
        <Input
          id="description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Café gratis en tu 5ta visita"
          className="text-neutral-900"
        />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="outline"
          className="border-neutral-300 text-neutral-700"
          onClick={() => router.push("/dashboard/regalos")}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          className="bg-neutral-900 text-white hover:bg-neutral-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Guardando..." : giftId ? "Guardar cambios" : "Crear regalo"}
        </Button>
      </div>
    </div>
  );
}
