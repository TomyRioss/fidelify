"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiSearch } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBranch } from "@/lib/branch-context";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
};

type Props = {
  couponId: string;
  couponName: string;
  clients: Client[];
};

export default function AssignCouponForm({ couponId, couponName, clients }: Props) {
  const router = useRouter();
  const { activeBranch } = useBranch();
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredClients = clients.filter((c) => {
    const q = clientSearch.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.dni.includes(q)
    );
  });

  async function handleAssign() {
    if (!selectedClientId) {
      toast.error("Seleccioná un cliente.");
      return;
    }
    if (!activeBranch) {
      toast.error("No hay sucursal activa seleccionada.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/coupons/${couponId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId, branchId: activeBranch.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al asignar el cupón.");
      }
      router.push("/dashboard/cupones");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[AssignCouponForm] handleAssign error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-neutral-200 bg-white p-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-neutral-500">
          Cupón: <span className="font-medium text-neutral-900">{couponName}</span>
        </p>
      </div>
      {!activeBranch && (
        <p className="text-xs text-red-500">No hay sucursal activa seleccionada.</p>
      )}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
          <Input
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="pl-9 text-neutral-900"
          />
        </div>
        <div className="border border-neutral-200 max-h-48 overflow-y-auto">
          {filteredClients.length === 0 ? (
            <p className="px-3 py-2 text-sm text-neutral-400">Sin resultados.</p>
          ) : (
            filteredClients.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClientId(c.id)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  selectedClientId === c.id
                    ? "bg-neutral-900 text-white"
                    : "hover:bg-neutral-50 text-neutral-800"
                }`}
              >
                {c.firstName} {c.lastName}{" "}
                <span className="text-xs opacity-60">({c.dni})</span>
              </button>
            ))
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="outline"
          className="border-neutral-300 text-neutral-700"
          onClick={() => router.push("/dashboard/cupones")}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          className="bg-neutral-900 text-white hover:bg-neutral-700"
          onClick={handleAssign}
          disabled={loading || !activeBranch}
        >
          {loading ? "Asignando..." : "Asignar"}
        </Button>
      </div>
    </div>
  );
}
