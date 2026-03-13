"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    active: true,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Nombre y precio son requeridos.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          price: Number(form.price),
          category: form.category || null,
          active: form.active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear.");
      toast.success("Producto creado.");
      router.push("/dashboard/recursos/inventario");
    } catch (err) {
      console.error("[NewProductPage] submit error:", err);
      toast.error(err instanceof Error ? err.message : "Error al crear.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Nuevo producto</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Completá los datos del producto.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-neutral-700">Nombre *</Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ej: Hamburguesa Clásica"
            className="border-neutral-300 focus-visible:border-orange-400 text-neutral-900 placeholder:text-neutral-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description" className="text-neutral-700">Descripción</Label>
          <Input
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción opcional"
            className="border-neutral-300 focus-visible:border-orange-400 text-neutral-900 placeholder:text-neutral-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price" className="text-neutral-700">Precio *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            placeholder="1500"
            className="border-neutral-300 focus-visible:border-orange-400 text-neutral-900 placeholder:text-neutral-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category" className="text-neutral-700">Categoría</Label>
          <Input
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Ej: Comidas, Bebidas"
            className="border-neutral-300 focus-visible:border-orange-400 text-neutral-900 placeholder:text-neutral-400"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
            className="accent-orange-500"
          />
          Activo
        </label>

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="bg-orange-600 text-white hover:bg-orange-500"
          >
            {loading ? "Guardando..." : "Crear producto"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="bg-white border-orange-300 text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
