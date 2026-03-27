"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiUsers, FiAward } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RafflePrize = { first: string; second: string | null; third: string | null };

type Raffle = {
  id: string;
  name: string;
  description: string | null;
  prize: string;
  closingDate: string;
  participationType: "FREE" | "POINTS_COST";
  pointsCost: number | null;
  executed: boolean;
  createdAt: string;
  _count: { raffleEntries: number };
};

function parsePrize(prizeJson: string): RafflePrize {
  try {
    const p = JSON.parse(prizeJson);
    return { first: p.first ?? prizeJson, second: p.second ?? null, third: p.third ?? null };
  } catch {
    return { first: prizeJson, second: null, third: null };
  }
}

export default function RafflesTable({
  initialData,
  callerRole,
}: {
  initialData: Raffle[];
  callerRole: string;
}) {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>(initialData);
  const [search, setSearch] = useState("");
  const canManage = callerRole === "OWNER" || callerRole === "ADMIN";

  const filtered = raffles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 px-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
          <Input
            placeholder="Buscar sorteo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
          />
        </div>
        {canManage && (
          <Button
            onClick={() => router.push("/dashboard/sorteos/new")}
            className="bg-orange-600 text-white hover:bg-orange-500 gap-2 shrink-0"
          >
            <FiPlus />
            Nuevo sorteo
          </Button>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-orange-200 bg-orange-50 text-neutral-500 text-xs uppercase tracking-wide">
              <th className="px-6 py-3 text-left font-medium">Nombre</th>
              <th className="px-6 py-3 text-left font-medium">1° Premio</th>
              <th className="px-6 py-3 text-left font-medium">2° Premio</th>
              <th className="px-6 py-3 text-left font-medium">3° Premio</th>
              <th className="px-6 py-3 text-left font-medium">Participantes</th>
              <th className="px-6 py-3 text-left font-medium">Costo</th>
              <th className="px-6 py-3 text-left font-medium">Cierre</th>
              <th className="px-6 py-3 text-left font-medium">Estado</th>
              {canManage && <th className="px-6 py-3 text-right font-medium">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 9 : 8} className="px-6 py-12 text-center text-neutral-400">
                  No hay sorteos{search ? " que coincidan con la búsqueda" : ""}.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const prize = parsePrize(r.prize);
                return (
                  <tr key={r.id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      <div>{r.name}</div>
                      {r.description && (
                        <div className="text-xs text-neutral-400 mt-0.5 max-w-[160px] truncate">{r.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <FiAward className="text-neutral-400 shrink-0" />
                        {prize.first}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500">{prize.second ?? <span className="text-neutral-300">—</span>}</td>
                    <td className="px-6 py-4 text-neutral-500">{prize.third ?? <span className="text-neutral-300">—</span>}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-neutral-700">
                        <FiUsers className="text-neutral-400 shrink-0" />
                        {r._count.raffleEntries}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {r.participationType === "FREE" ? (
                        <span className="text-neutral-500">Gratis</span>
                      ) : (
                        <span className="text-neutral-800 font-medium">{r.pointsCost} pts</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">
                      {new Date(r.closingDate).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {r.executed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-500">
                          Ejecutado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-600 text-white">
                          Activo
                        </span>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/sorteos/${r.id}/edit`)}
                            className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors"
                            title="Editar"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/sorteos/${r.id}/delete`)}
                            className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
