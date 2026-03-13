"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NuevaSucursalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al crear sucursal");
      }
      toast.success("Sucursal creada correctamente");
      router.push("/dashboard/configuracion/sucursales");
    } catch (err) {
      console.error("[NuevaSucursalPage] submit error:", err);
      toast.error(err instanceof Error ? err.message : "Error al crear sucursal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Nueva sucursal</h1>
        <p className="text-sm text-neutral-500">Completá los datos de la nueva sucursal</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-neutral-700">Nombre *</Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Ej: Sucursal Centro" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address" className="text-neutral-700">Dirección</Label>
          <Input id="address" name="address" value={form.address} onChange={handleChange} placeholder="Ej: Av. Corrientes 1234" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone" className="text-neutral-700">Teléfono</Label>
          <Input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Ej: +54 11 1234-5678" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-500 text-white">
            {loading ? "Guardando..." : "Crear sucursal"}
          </Button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/configuracion/sucursales")}
            className="inline-flex items-center justify-center rounded-lg border border-orange-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
