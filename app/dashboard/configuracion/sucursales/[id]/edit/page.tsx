"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditarSucursalPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });

  useEffect(() => {
    fetch(`/api/dashboard/branches/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => setForm({ name: data.name, address: data.address ?? "", phone: data.phone ?? "" }))
      .catch((err) => {
        console.error("[EditarSucursalPage] fetch error:", err);
        toast.error("No se pudo cargar la sucursal");
        router.push("/dashboard/configuracion/sucursales");
      })
      .finally(() => setFetching(false));
  }, [id, router]);

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
      const res = await fetch(`/api/dashboard/branches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al guardar");
      }
      toast.success("Sucursal actualizada correctamente");
      router.push("/dashboard/configuracion/sucursales");
    } catch (err) {
      console.error("[EditarSucursalPage] submit error:", err);
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <p className="p-6 text-sm text-neutral-500">Cargando...</p>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Editar sucursal</h1>
        <p className="text-sm text-neutral-500">Modificá los datos de la sucursal</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-neutral-700">Nombre *</Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address" className="text-neutral-700">Dirección</Label>
          <Input id="address" name="address" value={form.address} onChange={handleChange} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone" className="text-neutral-700">Teléfono</Label>
          <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-500 text-white">
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
          <button type="button" onClick={() => router.push("/dashboard/configuracion/sucursales")} className="inline-flex items-center justify-center rounded-lg border border-orange-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-orange-50 hover:text-orange-600">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
