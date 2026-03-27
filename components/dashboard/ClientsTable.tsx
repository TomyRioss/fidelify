"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiInfo } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Client = {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  points: number;
  visitCount: number;
  active: boolean;
  createdAt: string;
};

export default function ClientsTable({ initialData }: { initialData: Client[] }) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(initialData);
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.dni.includes(q) ||
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 px-6">
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por DNI, nombre o email..."
            className="pl-9 text-neutral-900 placeholder:text-neutral-400"
          />
        </div>
        <Button onClick={() => router.push("/dashboard/clientes/new")} size="sm" className="flex items-center gap-2 shrink-0">
          <FiPlus className="text-base" />
          Nuevo cliente
        </Button>
      </div>

      <div className="border-t border-orange-200 bg-white overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-orange-50 text-left">
                <th className="px-6 py-4 font-medium text-neutral-600">DNI</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Nombre</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Teléfono</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Email</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Puntos</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Visitas</th>
                <th className="px-6 py-4 font-medium text-neutral-600">Alta</th>
                <th className="px-6 py-4 font-medium text-neutral-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-neutral-100 last:border-0 hover:bg-orange-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-neutral-700">{c.dni}</td>
                  <td className="px-6 py-4 font-medium text-neutral-900">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="px-6 py-4 text-neutral-500">{c.phone ?? "—"}</td>
                  <td className="px-6 py-4 text-neutral-500">{c.email ?? "—"}</td>
                  <td className="px-6 py-4 text-neutral-700">{c.points}</td>
                  <td className="px-6 py-4 text-neutral-700">{c.visitCount}</td>
                  <td className="px-6 py-4 text-neutral-500">
                    {new Date(c.createdAt).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/dashboard/clientes/${c.id}/edit`)}
                        title="Editar"
                        className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                      >
                        <FiEdit2 className="text-base" />
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/clientes/${c.id}/delete`)}
                        title="Eliminar"
                        className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-red-600 transition-colors"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/clientes/${c.id}`)}
                        title="Ver detalle"
                        className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                      >
                        <FiInfo className="text-base" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-400">
                    {search ? "Sin resultados para la búsqueda." : "No hay clientes registrados."}
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
