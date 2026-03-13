"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function ClientDetail({ client: initial }: { client: Client }) {
  const router = useRouter();
  const [points, setPoints] = useState(initial.points);
  const [addAmount, setAddAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAddPoints() {
    const amount = Number(addAmount);
    if (!addAmount || isNaN(amount) || amount <= 0) {
      toast.error("Ingresá un número positivo de puntos.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/clients/${initial.id}/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: amount }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al sumar puntos.");
      }
      const updated = await res.json();
      setPoints(updated.points);
      setAddAmount("");
      toast.success(`+${amount} puntos agregados.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[ClientDetail] handleAddPoints error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const rows: { label: string; value: string }[] = [
    { label: "DNI", value: initial.dni },
    { label: "Nombre", value: `${initial.firstName} ${initial.lastName}` },
    { label: "Teléfono", value: initial.phone ?? "—" },
    { label: "Email", value: initial.email ?? "—" },
    { label: "Visitas", value: String(initial.visitCount) },
    { label: "Estado", value: initial.active ? "Activo" : "Inactivo" },
    { label: "Alta", value: new Date(initial.createdAt).toLocaleDateString("es-AR") },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3 px-6 pt-6">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-1.5">
          <FiArrowLeft />
          Volver
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {initial.firstName} {initial.lastName}
        </h1>
      </div>

      {/* Info card */}
      <div className="border border-neutral-200 bg-white overflow-hidden w-full">
        <div className="px-6 py-4 border-b border-neutral-100 bg-orange-50">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Información del cliente</p>
        </div>
        <div className="divide-y divide-neutral-100">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex justify-between px-6 py-3 text-sm">
              <span className="text-neutral-500">{label}</span>
              <span className="text-neutral-900 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Points card */}
      <div className="border border-neutral-200 bg-white overflow-hidden w-full">
        <div className="px-6 py-4 border-b border-neutral-100 bg-orange-50">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Puntos de fidelidad</p>
        </div>
        <div className="px-6 py-6 flex flex-col gap-4">
          <p className="text-4xl font-bold text-neutral-900">{points}</p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="addPoints">Sumar puntos</Label>
            <div className="flex gap-2">
              <Input
                id="addPoints"
                type="number"
                min={1}
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="Ej: 50"
                className="w-40"
              />
              <Button onClick={handleAddPoints} disabled={loading} className="flex items-center gap-1.5">
                <FiPlus />
                {loading ? "Sumando..." : "Sumar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
