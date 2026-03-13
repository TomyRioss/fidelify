"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FiPlus, FiEdit2 } from "react-icons/fi";
import { useSession } from "next-auth/react";


type Branch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  active: boolean;
};

export default function SucursalesPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const canCreate = role === "OWNER" || role === "ADMIN";
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/branches")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(setBranches)
      .catch((err) => {
        console.error("[SucursalesPage] fetch error:", err);
        toast.error("No se pudieron cargar las sucursales");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Sucursales</h1>
          <p className="text-sm text-neutral-500">Gestioná las sucursales de tu negocio</p>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/configuracion/sucursales/new"
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
          >
            <FiPlus />
            Nueva sucursal
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando...</p>
      ) : branches.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay sucursales registradas.</p>
      ) : (
        <div className="w-full border border-orange-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-orange-50 text-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Dirección</th>
                <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {branches.map((branch) => (
                <tr key={branch.id} className="bg-white hover:bg-orange-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-neutral-900">{branch.name}</td>
                  <td className="px-4 py-3 text-neutral-500">{branch.address ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-500">{branch.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${branch.active ? "bg-neutral-100 text-neutral-700" : "bg-neutral-200 text-neutral-500"}`}>
                      {branch.active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/configuracion/sucursales/${branch.id}/edit`}
                      className="flex items-center gap-1 text-orange-600 hover:text-orange-500 text-xs font-medium"
                    >
                      <FiEdit2 /> Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
