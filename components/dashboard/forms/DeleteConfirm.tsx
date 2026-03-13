"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  description: string;
  deleteUrl: string;
  backUrl: string;
  method?: "DELETE" | "POST";
};

export default function DeleteConfirm({ label, description, deleteUrl, backUrl, method = "DELETE" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(deleteUrl, { method });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al eliminar.");
      }
      toast.success(`${label} eliminado.`);
      router.push(backUrl);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[DeleteConfirm] handleDelete error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="px-6 pt-6">
        <h1 className="text-xl font-semibold text-neutral-900">Eliminar {label}</h1>
      </div>
      <div className="px-6 pb-6">
        <div className="border border-neutral-200 bg-white overflow-hidden w-full">
          <div className="px-6 py-6">
            <p className="text-sm text-neutral-600">{description} Esta acción no se puede deshacer.</p>
          </div>
          <div className="px-6 py-4 border-t border-neutral-200 flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(backUrl)}
              disabled={loading}
              className="border-neutral-300 text-neutral-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
