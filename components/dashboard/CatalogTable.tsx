"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiPlus, FiEdit2, FiTrash2, FiImage } from "react-icons/fi";
import { Button } from "@/components/ui/button";

type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  pointCost: number;
  active: boolean;
  imageUrl: string | null;
  createdAt: string;
};

type CallerRole = "OWNER" | "ADMIN" | "EMPLOYEE";

export default function CatalogTable({
  initialData,
  callerRole,
}: {
  initialData: CatalogProduct[];
  callerRole: CallerRole;
}) {
  const router = useRouter();
  const canManage = callerRole === "OWNER" || callerRole === "ADMIN";

  async function handleToggleActive(product: CatalogProduct) {
    try {
      const res = await fetch(`/api/dashboard/catalog/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al actualizar el estado.");
      }
      toast.success(product.active ? "Producto desactivado." : "Producto activado.");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[CatalogTable] handleToggleActive error:", err);
      toast.error(message);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 px-6">
        <p className="text-sm text-neutral-500">
          {initialData.length} producto{initialData.length !== 1 ? "s" : ""} en el catálogo
        </p>
        {canManage && (
          <Button
            onClick={() => router.push("/dashboard/puntos/new")}
            size="sm"
            className="flex items-center gap-2"
          >
            <FiPlus className="text-base" />
            Nuevo producto
          </Button>
        )}
      </div>

      <div className="border-t border-orange-200 bg-white overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-orange-50 text-left">
                <th className="px-6 py-4 font-medium text-neutral-600">Imagen</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Nombre</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Descripción</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Costo (pts)</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Estado</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {initialData.map((product) => (
                <tr key={product.id} className="border-b border-neutral-100 last:border-0 hover:bg-orange-50 transition-colors">
                  <td className="px-6 py-4">
                    {product.imageUrl ? (
                      <div className="relative w-10 h-10 rounded border border-orange-100 overflow-hidden">
                        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="40px" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded border border-neutral-200 bg-neutral-50 flex items-center justify-center">
                        <FiImage size={14} className="text-neutral-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-neutral-900">{product.name}</td>
                  <td className="px-6 py-4 text-neutral-500">{product.description ?? "—"}</td>
                  <td className="px-6 py-4 text-neutral-700">{product.pointCost}</td>
                  <td className="px-6 py-4">
                    {canManage ? (
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${product.active ? "bg-orange-600 text-white hover:bg-orange-500" : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"}`}
                      >
                        {product.active ? "Activo" : "Inactivo"}
                      </button>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.active ? "bg-orange-600 text-white" : "bg-neutral-200 text-neutral-600"}`}>
                        {product.active ? "Activo" : "Inactivo"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {canManage ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/dashboard/puntos/${product.id}/edit`)}
                          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                          title="Editar"
                        >
                          <FiEdit2 className="text-base" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/puntos/${product.id}/delete`)}
                          className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <FiTrash2 className="text-base" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-neutral-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {initialData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                    No hay productos en el catálogo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
