"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type GiftMilestone = {
  id: string;
  visitTrigger: number;
  giftType: string;
  description: string;
  active: boolean;
  createdAt: string;
};

type CallerRole = "OWNER" | "ADMIN" | "EMPLOYEE";

const GIFT_TYPES = [
  { value: "FREE_PRODUCT", label: "Producto gratis" },
  { value: "DISCOUNT", label: "Descuento" },
  { value: "COUPON", label: "Cupón" },
  { value: "CUSTOM", label: "Personalizado" },
];

function giftTypeLabel(type: string) {
  return GIFT_TYPES.find((t) => t.value === type)?.label ?? type;
}

export default function GiftsTable({
  initialData,
  callerRole,
}: {
  initialData: GiftMilestone[];
  callerRole: CallerRole;
}) {
  const router = useRouter();
  const canManage = callerRole === "OWNER" || callerRole === "ADMIN";

  async function handleToggleActive(gift: GiftMilestone) {
    try {
      const res = await fetch(`/api/dashboard/gifts/${gift.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !gift.active }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al actualizar el estado.");
      }
      toast.success(gift.active ? "Regalo desactivado." : "Regalo activado.");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[GiftsTable] handleToggleActive error:", err);
      toast.error(message);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 px-6">
        <p className="text-sm text-neutral-500">
          {initialData.length} hito{initialData.length !== 1 ? "s" : ""} de regalo
        </p>
        {canManage && (
          <Button
            onClick={() => router.push("/dashboard/regalos/new")}
            size="sm"
            className="flex items-center gap-2"
          >
            <FiPlus className="text-base" />
            Nuevo regalo
          </Button>
        )}
      </div>

      <div className="border-t border-orange-200 bg-white overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-orange-50 text-left">
                <th className="px-6 py-4 font-medium text-neutral-600">Visitas requeridas</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Tipo</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Descripción</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Estado</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {initialData.map((gift) => (
                <tr key={gift.id} className="border-b border-neutral-100 last:border-0 hover:bg-orange-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-neutral-900">{gift.visitTrigger}</td>
                  <td className="px-6 py-4 text-neutral-700">{giftTypeLabel(gift.giftType)}</td>
                  <td className="px-6 py-4 text-neutral-500">{gift.description}</td>
                  <td className="px-6 py-4">
                    {canManage ? (
                      <button
                        onClick={() => handleToggleActive(gift)}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${gift.active ? "bg-orange-600 text-white hover:bg-orange-500" : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"}`}
                      >
                        {gift.active ? "Activo" : "Inactivo"}
                      </button>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${gift.active ? "bg-orange-600 text-white" : "bg-neutral-200 text-neutral-600"}`}>
                        {gift.active ? "Activo" : "Inactivo"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {canManage ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/dashboard/regalos/${gift.id}/edit`)}
                          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                          title="Editar"
                        >
                          <FiEdit2 className="text-base" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/regalos/${gift.id}/delete`)}
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
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                    No hay hitos de regalo configurados.
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
