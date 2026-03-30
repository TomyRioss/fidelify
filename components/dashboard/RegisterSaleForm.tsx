"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiSearch, FiDollarSign } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useBranch } from "@/lib/branch-context";

interface SaleResult {
  clientName: string;
  total: number;
  pointsEarned: number;
  clientPoints: number;
}

export default function RegisterSaleForm() {
  const { activeBranch } = useBranch();
  const [dni, setDni] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SaleResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeBranch) {
      toast.error("Seleccioná una sucursal antes de registrar una venta.");
      return;
    }
    if (!dni.trim()) {
      toast.error("Ingresá el DNI del cliente.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Ingresá un monto válido.");
      return;
    }

    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/dashboard/sales/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: dni.trim(), amount: Number(amount), branchId: activeBranch.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("[RegisterSaleForm] Error:", data.error);
        toast.error(data.error || "Error al registrar la venta.");
        return;
      }
      setResult(data);
      setDni("");
      setAmount("");
      toast.success("Venta registrada correctamente.");
    } catch (err) {
      console.error("[RegisterSaleForm] Unexpected error:", err);
      toast.error("Error inesperado al registrar la venta.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setResult(null);
    setDni("");
    setAmount("");
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="border border-orange-200 bg-white overflow-hidden w-full">
        <div className="px-6 py-4 border-b border-orange-100">
          <h2 className="text-sm font-semibold text-neutral-800">Datos de la venta</h2>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dni" className="text-neutral-700">DNI del cliente</Label>
            <Input
              id="dni"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ingresá el DNI del cliente"
              className="border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount" className="text-neutral-700">Monto de la venta ($)</Label>
            <Input
              id="amount"
              type="number"
              min={1}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ej: 25000"
              className="border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
            />
          </div>
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={submitting || !dni.trim() || !amount}
              className="bg-orange-600 text-white hover:bg-orange-500 flex items-center gap-2"
            >
              <FiDollarSign size={16} />
              {submitting ? "Registrando..." : "Registrar venta"}
            </Button>
          </div>
        </form>
      </div>

      {result && (
        <div className="border border-orange-200 bg-orange-50 overflow-hidden w-full">
          <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-800">Venta registrada</h2>
            <button
              onClick={handleReset}
              className="text-xs text-neutral-500 hover:text-neutral-800 underline"
            >
              Nueva venta
            </button>
          </div>
          <div className="px-6 py-4 flex flex-col gap-2">
            <p className="text-base font-semibold text-neutral-900">{result.clientName}</p>
            <p className="text-sm text-neutral-600">
              Monto: <span className="font-semibold text-neutral-800">${result.total.toLocaleString("es-AR")}</span>
            </p>
            <p className="text-sm text-neutral-600">
              Puntos sumados: <span className="font-semibold text-orange-600">+{result.pointsEarned}</span>
            </p>
            <p className="text-sm text-neutral-600">
              Puntos totales del cliente: <span className="font-semibold text-neutral-800">{result.clientPoints}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
