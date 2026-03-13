"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiSearch, FiPlus } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
  points: number;
}

export default function ManualPointsForm() {
  const [dni, setDni] = useState("");
  const [searching, setSearching] = useState(false);
  const [client, setClient] = useState<ClientData | null>(null);
  const [pointsInput, setPointsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!dni.trim()) return;
    setSearching(true);
    setClient(null);
    try {
      const res = await fetch(`/api/dashboard/clients/by-dni?dni=${encodeURIComponent(dni.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        console.error("[ManualPointsForm] Search error:", data.error);
        toast.error(data.error || "Cliente no encontrado.");
        return;
      }
      setClient(data);
    } catch (err) {
      console.error("[ManualPointsForm] Search unexpected error:", err);
      toast.error("Error al buscar el cliente.");
    } finally {
      setSearching(false);
    }
  }

  async function handleAddPoints(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;
    const points = Number(pointsInput);
    if (!points || isNaN(points) || points <= 0) {
      toast.error("Ingresá una cantidad de puntos válida.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/dashboard/clients/${client.id}/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("[ManualPointsForm] Add points error:", data.error);
        toast.error(data.error || "Error al sumar puntos.");
        return;
      }
      setClient((prev) => prev ? { ...prev, points: data.points } : null);
      setPointsInput("");
      toast.success(`Se sumaron ${points} puntos a ${client.firstName} ${client.lastName}.`);
    } catch (err) {
      console.error("[ManualPointsForm] Add points unexpected error:", err);
      toast.error("Error al sumar puntos.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setDni("");
    setClient(null);
    setPointsInput("");
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search */}
      <div className="border border-neutral-200 bg-white overflow-hidden w-full">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-sm font-semibold text-neutral-800">Buscar cliente</h2>
        </div>
        <form onSubmit={handleSearch} className="px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1.5 flex-1">
            <Label htmlFor="dni" className="text-neutral-700">DNI</Label>
            <Input
              id="dni"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ingresá el DNI del cliente"
              className="border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
            />
          </div>
          <Button
            type="submit"
            disabled={searching || !dni.trim()}
            className="bg-neutral-900 text-white hover:bg-neutral-700 flex items-center gap-2"
          >
            <FiSearch size={16} />
            {searching ? "Buscando..." : "Buscar"}
          </Button>
        </form>
      </div>

      {/* Client info + add points */}
      {client && (
        <div className="border border-neutral-200 bg-white overflow-hidden w-full">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-800">Cliente encontrado</h2>
            <button
              onClick={handleReset}
              className="text-xs text-neutral-500 hover:text-neutral-800 underline"
            >
              Nueva búsqueda
            </button>
          </div>
          <div className="px-6 py-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold text-neutral-900">
                {client.firstName} {client.lastName}
              </p>
              <p className="text-sm text-neutral-500">
                Puntos actuales: <span className="font-semibold text-neutral-800">{client.points}</span>
              </p>
            </div>
            <form onSubmit={handleAddPoints} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-1.5 flex-1">
                <Label htmlFor="points" className="text-neutral-700">Puntos a sumar</Label>
                <Input
                  id="points"
                  type="number"
                  min={1}
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  placeholder="Cantidad de puntos"
                  className="border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting || !pointsInput}
                className="bg-neutral-900 text-white hover:bg-neutral-700 flex items-center gap-2"
              >
                <FiPlus size={16} />
                {submitting ? "Sumando..." : "Sumar puntos"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
