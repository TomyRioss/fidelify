"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiUpload, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

type Props = {
  productId?: string;
  defaultValues?: {
    name?: string;
    description?: string;
    pointCost?: string;
    imageUrl?: string;
    active?: boolean;
  };
};

export default function CatalogProductForm({ productId, defaultValues }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: defaultValues?.name ?? "",
    description: defaultValues?.description ?? "",
    pointCost: defaultValues?.pointCost ?? "",
    imageUrl: defaultValues?.imageUrl ?? "",
    active: defaultValues?.active !== undefined ? defaultValues.active : true,
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/dashboard/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al subir la imagen.");
      }
      const { url } = await res.json();
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[CatalogProductForm] handleFileChange error:", err);
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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
      const payload = {
        name: form.name,
        description: form.description || null,
        pointCost: cost,
        imageUrl: form.imageUrl || null,
        active: form.active,
      };
      const url = productId ? `/api/dashboard/catalog/${productId}` : "/api/dashboard/catalog";
      const method = productId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al guardar el producto.");
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
    <div className="border border-orange-200 bg-white p-6 flex flex-col gap-5">
      {/* Imagen */}
      <div className="flex flex-col gap-2">
        <Label className="text-neutral-700 font-medium">Imagen</Label>
        {form.imageUrl ? (
          <div className="flex items-start gap-3">
            <div className="relative w-24 h-24 rounded border border-orange-200 overflow-hidden shrink-0">
              <Image
                src={form.imageUrl}
                alt="Preview"
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <Button
              type="button"
              className="bg-white border border-neutral-300 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-800 flex items-center gap-1.5 text-sm"
              onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
              disabled={uploading || loading}
            >
              <FiX size={13} /> Quitar imagen
            </Button>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              className="bg-white border border-orange-300 text-neutral-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || loading}
            >
              <FiUpload size={14} />
              {uploading ? "Subiendo..." : "Subir imagen"}
            </Button>
            <p className="text-xs text-neutral-400 mt-1.5">JPG, PNG o WebP. Máx 5 MB.</p>
          </div>
        )}
      </div>

      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-neutral-700 font-medium">Nombre *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Café gratis"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>

      {/* Descripción */}
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

      {/* Costo en puntos */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pointCost" className="text-neutral-700 font-medium">Costo en puntos *</Label>
        <Input
          id="pointCost"
          type="number"
          min="1"
          value={form.pointCost}
          onChange={(e) => setForm((f) => ({ ...f, pointCost: e.target.value }))}
          placeholder="100"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>

      {/* Estado activo/inactivo */}
      <div className="flex items-center justify-between border border-neutral-200 rounded p-3">
        <div>
          <p className="text-sm font-medium text-neutral-800">Estado del producto</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {form.active ? "Visible para clientes en la tienda" : "Oculto en la tienda de puntos"}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.active}
          onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
            form.active ? "bg-orange-600" : "bg-neutral-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
              form.active ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          className="bg-white border border-orange-300 text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
          onClick={() => router.push("/dashboard/puntos")}
          disabled={loading || uploading}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          className="bg-orange-600 text-white hover:bg-orange-500"
          onClick={handleSubmit}
          disabled={loading || uploading}
        >
          {loading ? "Guardando..." : productId ? "Guardar cambios" : "Crear producto"}
        </Button>
      </div>
    </div>
  );
}
