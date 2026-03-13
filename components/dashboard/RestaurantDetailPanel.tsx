"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiEdit2, FiTrash2, FiPlus, FiUser, FiUsers, FiMapPin } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UserEntry = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

type Branch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  active: boolean;
};

type DetailData = {
  ownerUser: UserEntry | null;
  teamUsers: UserEntry[];
  usersCount: number;
  branches: Branch[];
};

export default function RestaurantDetailPanel({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();
  const [data, setData] = useState<DetailData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  async function fetchDetail() {
    setLoadingData(true);
    try {
      const res = await fetch(`/api/admin/restaurants/${restaurantId}`);
      if (!res.ok) throw new Error("Error al cargar los detalles.");
      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[RestaurantDetailPanel] fetchDetail error:", err);
      toast.error(message);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    fetchDetail();
  }, [restaurantId]);

  if (loadingData) {
    return <div className="px-6 py-4 text-sm text-neutral-400">Cargando detalles...</div>;
  }

  if (!data) return null;

  return (
    <div className="bg-neutral-50 border-t border-neutral-100 px-6 py-5 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Owner */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">
          <FiUser className="text-sm" />
          Owner
        </div>
        {data.ownerUser ? (
          <div className="bg-white rounded-xl border border-neutral-200 px-4 py-3 flex flex-col gap-1">
            <p className="text-sm font-medium text-neutral-900">{data.ownerUser.name}</p>
            <p className="text-xs text-neutral-500">{data.ownerUser.email}</p>
            <span className={`mt-1 self-start inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${data.ownerUser.active ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-600"}`}>
              {data.ownerUser.active ? "Activo" : "Inactivo"}
            </span>
          </div>
        ) : (
          <p className="text-sm text-neutral-400">Sin owner asignado.</p>
        )}
      </div>

      {/* Team */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">
            <FiUsers className="text-sm" />
            Equipo
          </div>
          <button
            onClick={() => router.push(`/admin/dashboard/restaurantes/${restaurantId}/users/new`)}
            className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg px-2 py-1 hover:bg-white transition-colors"
          >
            <FiPlus className="text-xs" />
            Añadir
          </button>
        </div>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {data.teamUsers.length === 0 && (
            <p className="text-sm text-neutral-400">Sin usuarios en el equipo.</p>
          )}
          {data.teamUsers.map((u) => (
            <div key={u.id} className="bg-white rounded-xl border border-neutral-200 px-3 py-2.5 flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{u.name}</p>
                <p className="text-xs text-neutral-500 truncate">{u.email}</p>
                <span className="self-start inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                  {u.role}
                </span>
              </div>
              <button
                onClick={() => router.push(`/admin/dashboard/restaurantes/${restaurantId}/users/${u.id}/edit`)}
                className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors shrink-0"
                title="Editar"
              >
                <FiEdit2 className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Users count */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">
          <FiUsers className="text-sm" />
          Usuarios
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 px-4 py-3">
          <p className="text-2xl font-semibold text-neutral-900">{data.usersCount}</p>
          <p className="text-xs text-neutral-500 mt-0.5">usuario{data.usersCount !== 1 ? "s" : ""} registrado{data.usersCount !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Branches */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">
            <FiMapPin className="text-sm" />
            Sucursales
          </div>
          <button
            onClick={() => router.push(`/admin/dashboard/restaurantes/${restaurantId}/branches/new`)}
            className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg px-2 py-1 hover:bg-white transition-colors"
          >
            <FiPlus className="text-xs" />
            Nueva
          </button>
        </div>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {data.branches.length === 0 && (
            <p className="text-sm text-neutral-400">Sin sucursales.</p>
          )}
          {data.branches.map((branch) => (
            <div key={branch.id} className="bg-white rounded-xl border border-neutral-200 px-3 py-2.5 flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{branch.name}</p>
                {branch.address && <p className="text-xs text-neutral-500 truncate">{branch.address}</p>}
                {branch.phone && <p className="text-xs text-neutral-400">{branch.phone}</p>}
                <span className={`self-start inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${branch.active ? "bg-neutral-100 text-neutral-600" : "bg-red-50 text-red-600"}`}>
                  {branch.active ? "Activa" : "Inactiva"}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => router.push(`/admin/dashboard/restaurantes/${restaurantId}/branches/${branch.id}/edit`)}
                  className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors"
                  title="Editar"
                >
                  <FiEdit2 className="text-xs" />
                </button>
                <button
                  onClick={() => router.push(`/admin/dashboard/restaurantes/${restaurantId}/branches/${branch.id}/delete`)}
                  className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                  title="Eliminar"
                >
                  <FiTrash2 className="text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
