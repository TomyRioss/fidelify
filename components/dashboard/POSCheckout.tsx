"use client";

import { useState, useEffect, useRef } from "react";
import { FiX, FiSearch } from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CartItem } from "./POSCart";

interface FoundClient {
  id: string;
  firstName: string;
  lastName: string;
  points: number;
  visitCount: number;
}

interface Props {
  items: CartItem[];
  branchId: string;
  total: number;
  onClose: () => void;
  onConfirmed: (result: { pointsEarned: number; clientPoints: number }) => void;
}

export default function POSCheckout({ items, branchId, total, onClose, onConfirmed }: Props) {
  const [dni, setDni] = useState("");
  const [client, setClient] = useState<FoundClient | null>(null);
  const [clientError, setClientError] = useState("");
  const [searching, setSearching] = useState(false);
  const [countAsVisit, setCountAsVisit] = useState(true);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setClient(null);
    setClientError("");
    if (!dni || dni.length < 6) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/dashboard/clients/by-dni?dni=${encodeURIComponent(dni)}`);
        if (res.status === 404) {
          setClientError("Cliente no encontrado.");
          setClient(null);
        } else if (!res.ok) {
          setClientError("Error al buscar cliente.");
          setClient(null);
        } else {
          const data = await res.json();
          setClient(data);
          setClientError("");
        }
      } catch {
        setClientError("Error al buscar cliente.");
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [dni]);

  async function handleConfirm() {
    if (!client) {
      toast.error("Buscá un cliente válido para confirmar.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          clientId: client.id,
          countAsVisit,
          branchId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar la venta.");
      toast.success(
        `Venta confirmada. +${data.pointsEarned} puntos. Total puntos: ${data.clientPoints}`
      );
      onConfirmed({ pointsEarned: data.pointsEarned, clientPoints: data.clientPoints });
    } catch (err) {
      console.error("[POSCheckout] confirm error:", err);
      toast.error(err instanceof Error ? err.message : "Error al procesar la venta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl border border-orange-200 bg-white p-6 shadow-lg mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-neutral-900">Cobrar venta</h2>
          <button
            onClick={onClose}
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-lg bg-orange-50 px-4 py-3">
          <span className="text-sm text-neutral-700">Total a cobrar</span>
          <span className="text-xl font-bold text-orange-600">
            ${total.toLocaleString("es-AR")}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dni" className="text-neutral-700">DNI del cliente</Label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
              <Input
                id="dni"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ingresá el DNI"
                className="pl-8 border-neutral-300 focus-visible:border-orange-400 text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
            {searching && (
              <p className="text-xs text-neutral-500">Buscando...</p>
            )}
            {clientError && (
              <p className="text-xs text-red-500">{clientError}</p>
            )}
            {client && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5">
                <p className="text-sm font-medium text-neutral-900">
                  {client.firstName} {client.lastName}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {client.points} puntos · {client.visitCount} visitas
                </p>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={countAsVisit}
              onChange={(e) => setCountAsVisit(e.target.checked)}
              className="accent-orange-500"
            />
            <span className="text-sm text-neutral-700">Contar como visita</span>
          </label>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleConfirm}
              disabled={loading || !client}
              className="flex-1 bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-50"
            >
              {loading ? "Procesando..." : "Confirmar venta"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white border-orange-300 text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
