"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  couponId?: string;
  defaultValues?: {
    name?: string;
    type?: string;
    value?: string;
    expiresAt?: string;
    description?: string;
  };
};

export default function CouponForm({ couponId, defaultValues }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: defaultValues?.name ?? "",
    type: (defaultValues?.type as "PERCENTAGE" | "FIXED_AMOUNT") ?? "PERCENTAGE",
    value: defaultValues?.value ?? "",
    expiresAt: defaultValues?.expiresAt ? defaultValues.expiresAt.slice(0, 10) : "",
    description: defaultValues?.description ?? "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.name) {
      toast.error("El nombre es requerido.");
      return;
    }
    if (!form.value || isNaN(Number(form.value))) {
      toast.error("El valor debe ser un número válido.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        value: Number(form.value),
        expiresAt: form.expiresAt || null,
        description: form.description || null,
      };
      if (couponId) {
        const res = await fetch(`/api/dashboard/coupons/${couponId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al actualizar el cupón.");
        }
      } else {
        const res = await fetch("/api/dashboard/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al crear el cupón.");
        }
      }
      router.push("/dashboard/cupones");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[CouponForm] handleSubmit error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-orange-200 bg-white p-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-neutral-700 font-medium">Nombre *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Descuento bienvenida"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="type" className="text-neutral-700 font-medium">Tipo *</Label>
        <Select
          value={form.type}
          onValueChange={(v) => setForm((f) => ({ ...f, type: v as "PERCENTAGE" | "FIXED_AMOUNT" }))}
        >
          <SelectTrigger id="type" className="bg-white border-neutral-300 text-neutral-900 focus:border-orange-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PERCENTAGE">Porcentaje</SelectItem>
            <SelectItem value="FIXED_AMOUNT">Monto fijo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="value" className="text-neutral-700 font-medium">Valor * {form.type === "PERCENTAGE" ? "(%)" : "($)"}</Label>
        <Input
          id="value"
          type="number"
          min="0"
          value={form.value}
          onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
          placeholder={form.type === "PERCENTAGE" ? "10" : "500"}
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expiresAt" className="text-neutral-700 font-medium">Fecha de expiración</Label>
        <Input
          id="expiresAt"
          type="date"
          value={form.expiresAt}
          onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
          className="bg-white border-neutral-300 text-neutral-900 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description" className="text-neutral-700 font-medium">Descripción</Label>
        <Input
          id="description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Descripción opcional"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          className="bg-white border border-orange-300 text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
          onClick={() => router.push("/dashboard/cupones")}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          className="bg-orange-600 text-white hover:bg-orange-500"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Guardando..." : couponId ? "Guardar cambios" : "Crear cupón"}
        </Button>
      </div>
    </div>
  );
}
