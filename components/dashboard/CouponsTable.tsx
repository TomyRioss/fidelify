"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiPlus, FiEdit2, FiTrash2, FiShare2, FiSearch } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBranch } from "@/lib/branch-context";

type Coupon = {
  id: string;
  name: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_PRODUCT" | "CUSTOM";
  value: string | null;
  expiresAt: string | null;
  createdAt: string;
  _count: { couponAssignments: number };
};

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
};

export default function CouponsTable({
  initialData,
  clients,
  callerRole,
}: {
  initialData: Coupon[];
  clients: Client[];
  callerRole: string;
}) {
  const router = useRouter();
  const { activeBranch } = useBranch();
  const [coupons, setCoupons] = useState<Coupon[]>(initialData);
  const [search, setSearch] = useState("");

  const canManage = callerRole !== "EMPLOYEE";

  const filtered = coupons.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function formatValue(coupon: Coupon) {
    if (!coupon.value) return "—";
    return coupon.type === "PERCENTAGE"
      ? `${coupon.value}%`
      : `$${Number(coupon.value).toFixed(2)}`;
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 px-6">
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="pl-9 text-neutral-900 placeholder:text-neutral-400"
          />
        </div>
        {canManage && (
          <Button onClick={() => router.push("/dashboard/cupones/new")} size="sm" className="flex items-center gap-2 shrink-0">
            <FiPlus className="text-base" />
            Nuevo cupón
          </Button>
        )}
      </div>

      <div className="border-t border-neutral-200 bg-white overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-orange-50 text-left">
                <th className="px-6 py-4 font-medium text-neutral-600">Nombre</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Tipo</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Valor</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Vence</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Asignaciones</th>
                {canManage && (
                  <th className="px-6 py-4 font-medium text-neutral-600 text-right">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-neutral-100 last:border-0 hover:bg-orange-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-neutral-900">{c.name}</td>
                  <td className="px-6 py-4 text-neutral-500">
                    {c.type === "PERCENTAGE" ? "Porcentaje" : "Monto fijo"}
                  </td>
                  <td className="px-6 py-4 text-neutral-700">{formatValue(c)}</td>
                  <td className="px-6 py-4 text-neutral-500">
                    {c.expiresAt
                      ? new Date(c.expiresAt).toLocaleDateString("es-AR")
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-neutral-700">{c._count.couponAssignments}</td>
                  {canManage && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/dashboard/cupones/${c.id}/asignar`)}
                          title="Asignar a cliente"
                          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                        >
                          <FiShare2 className="text-base" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/cupones/${c.id}/edit`)}
                          title="Editar"
                          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                        >
                          <FiEdit2 className="text-base" />
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/cupones/${c.id}/delete`)}
                          title="Eliminar"
                          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-red-600 transition-colors"
                        >
                          <FiTrash2 className="text-base" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={canManage ? 6 : 5}
                    className="px-4 py-8 text-center text-neutral-400"
                  >
                    {search ? "Sin resultados para la búsqueda." : "No hay cupones registrados."}
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
