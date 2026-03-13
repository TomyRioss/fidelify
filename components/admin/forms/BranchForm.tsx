"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  restaurantId: string;
  branchId?: string;
  defaultValues?: {
    name?: string;
    address?: string;
    phone?: string;
  };
};

export default function BranchForm({ restaurantId, branchId, defaultValues }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: defaultValues?.name ?? "",
    address: defaultValues?.address ?? "",
    phone: defaultValues?.phone ?? "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.name) {
      toast.error("El nombre de la sucursal es requerido.");
      return;
    }
    setLoading(true);
    try {
      const url = branchId
        ? `/api/admin/restaurants/${restaurantId}/branches/${branchId}`
        : `/api/admin/restaurants/${restaurantId}/branches`;
      const method = branchId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          address: form.address || null,
          phone: form.phone || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al guardar la sucursal.");
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[BranchForm] handleSubmit error:", err);
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
          placeholder="Sucursal Centro"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          placeholder="Av. Corrientes 1234"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+54 11 0000-0000"
          className="text-neutral-900"
        />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="outline"
          className="border-neutral-300 text-neutral-700"
          onClick={() => router.push("/admin/dashboard")}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          className="bg-neutral-900 text-white hover:bg-neutral-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Guardando..." : branchId ? "Guardar cambios" : "Crear sucursal"}
        </Button>
      </div>
    </div>
  );
}
