"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import InventoryTable, { MenuItem } from "@/components/dashboard/InventoryTable";
import InventoryImport from "@/components/dashboard/InventoryImport";

export default function InventarioPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/menu-items");
      if (!res.ok) throw new Error("Error al cargar productos.");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("[InventarioPage] fetch error:", err);
      toast.error("Error al cargar el inventario.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Inventario</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Catálogo de productos del negocio.</p>
        </div>
        <div className="flex items-center gap-2">
          <InventoryImport onImported={fetchItems} />
          <Link
            href="/dashboard/recursos/inventario/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-orange-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-500 transition-colors"
          >
            <FiPlus className="text-base" />
            Nuevo producto
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-orange-200 bg-white">
        {loading ? (
          <p className="py-12 text-center text-sm text-neutral-500">Cargando...</p>
        ) : (
          <InventoryTable items={items} onDeleted={handleDeleted} />
        )}
      </div>
    </div>
  );
}
