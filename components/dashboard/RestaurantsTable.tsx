"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiEdit2, FiTrash2, FiPlus, FiChevronDown } from "react-icons/fi";
import RestaurantDetailPanel from "@/components/dashboard/RestaurantDetailPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SubscriptionStatus = "TRIAL" | "ACTIVE" | "INACTIVE";

type Restaurant = {
  id: string;
  name: string;
  email: string;
  slug: string;
  phone: string | null;
  address: string | null;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string | Date;
  _count: { branches: number };
};

export default function RestaurantsTable({ initialData }: { initialData: Restaurant[] }) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4 px-6">
        <p className="text-sm text-neutral-500">
          {initialData.length} negocio{initialData.length !== 1 ? "s" : ""} registrado{initialData.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={() => router.push("/admin/dashboard/restaurantes/new")} size="sm" className="flex items-center gap-2">
          <FiPlus className="text-base" />
          Nuevo negocio
        </Button>
      </div>

      <div className="border-t border-orange-200 bg-white overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-orange-50 text-left">
                <th className="px-4 py-5 w-8"></th>
                <th className="px-6 py-5 font-medium text-neutral-600">Nombre</th>
                <th className="px-6 py-5 font-medium text-neutral-600">Email</th>
                <th className="px-6 py-5 font-medium text-neutral-600">Slug</th>
                <th className="px-6 py-5 font-medium text-neutral-600">Estado</th>
                <th className="px-6 py-5 font-medium text-neutral-600">Sucursales</th>
                <th className="px-6 py-5 font-medium text-neutral-600">Creado</th>
                <th className="px-6 py-5 font-medium text-neutral-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {initialData.map((r) => (
                <React.Fragment key={r.id}>
                  <tr className="border-b border-neutral-100 hover:bg-orange-50 transition-colors">
                    <td className="px-4 py-5">
                      <button
                        onClick={() => toggleExpand(r.id)}
                        className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                        title="Ver detalles"
                      >
                        <FiChevronDown className={`text-base transition-transform duration-200 ${expandedId === r.id ? "rotate-180" : ""}`} />
                      </button>
                    </td>
                    <td className="px-6 py-5 font-medium text-neutral-900">{r.name}</td>
                    <td className="px-6 py-5 text-neutral-600">{r.email}</td>
                    <td className="px-6 py-5 text-neutral-500 font-mono text-xs">{r.slug}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.subscriptionStatus === "ACTIVE"
                          ? "bg-orange-600 text-white"
                          : r.subscriptionStatus === "TRIAL"
                          ? "bg-neutral-200 text-neutral-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {r.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-neutral-600">{r._count.branches}</td>
                    <td className="px-6 py-5 text-neutral-500">
                      {new Date(r.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/dashboard/restaurantes/${r.id}/edit`)}
                          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                          title="Editar"
                        >
                          <FiEdit2 className="text-base" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/dashboard/restaurantes/${r.id}/delete`)}
                          className="p-1.5 rounded hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <FiTrash2 className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === r.id && (
                    <tr>
                      <td colSpan={8} className="p-0">
                        <RestaurantDetailPanel restaurantId={r.id} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {initialData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-neutral-400">
                    No hay negocios registrados.
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
