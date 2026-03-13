"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    active: true,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/menu-items");
        if (!res.ok) throw new Error("Error al cargar.");
        const items = await res.json();
        const item = items.find((i: { id: string }) => i.id === id);
        if (!item) {
          toast.error("Producto no encontrado.");
          router.push("/dashboard/recursos/inventario");
          return;
        }
        setForm({
          name: item.name,
          description: item.description || "",
          price: String(item.price),
          category: item.category || "",
          active: item.active,
        });
      } catch (err) {
        console.error("[EditProductPage] load error:", err);
        toast.error("Error al cargar el producto.");
      } finally {
        setFetching(false);
      }
    }
    load();
  }, [id, router]);

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
      const res = await fetch(`/api/dashboard/menu-items/${id}`, {
        method: "PATCH",
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
      if (!res.ok) throw new Error(data.error || "Error al actualizar.");
      toast.success("Producto actualizado.");
      router.push("/dashboard/recursos/inventario");
    } catch (err) {
      console.error("[EditProductPage] submit error:", err);
      toast.error(err instanceof Error ? err.message : "Error al actualizar.");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <div className="p-6 text-sm text-neutral-500">Cargando...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Editar producto</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Modificá los datos del producto.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-neutral-700">Nombre *</Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
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
            {loading ? "Guardando..." : "Guardar cambios"}
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
