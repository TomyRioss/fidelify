"use client";

import Link from "next/link";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  active: boolean;
}

interface Props {
  items: MenuItem[];
  onDeleted: (id: string) => void;
}

export default function InventoryTable({ items, onDeleted }: Props) {
  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    try {
      const res = await fetch(`/api/dashboard/menu-items/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar.");
      }
      onDeleted(id);
      toast.success("Producto eliminado.");
    } catch (err) {
      console.error("[InventoryTable] delete error:", err);
      toast.error(err instanceof Error ? err.message : "Error al eliminar.");
    }
  }

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-500">
        No hay productos. Creá uno o importá un CSV.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-orange-200 bg-orange-50">
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Nombre</th>
            <th className="px-4 py-3 text-left font-medium text-neutral-700">Categoría</th>
            <th className="px-4 py-3 text-right font-medium text-neutral-700">Precio</th>
            <th className="px-4 py-3 text-center font-medium text-neutral-700">Estado</th>
            <th className="px-4 py-3 text-center font-medium text-neutral-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-orange-100 hover:bg-orange-50/40">
              <td className="px-4 py-3 text-neutral-900 font-medium">{item.name}</td>
              <td className="px-4 py-3 text-neutral-500">{item.category || "—"}</td>
              <td className="px-4 py-3 text-right text-neutral-900">
                ${Number(item.price).toLocaleString("es-AR")}
              </td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    item.active
                      ? "bg-orange-100 text-orange-700"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {item.active ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <Link
                    href={`/dashboard/recursos/inventario/${item.id}/edit`}
                    className="rounded p-1.5 text-neutral-500 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <FiEdit2 className="text-base" />
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="rounded p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <FiTrash2 className="text-base" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
