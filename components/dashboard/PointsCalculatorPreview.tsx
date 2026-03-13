"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function PointsCalculatorPreview() {
  const [amount, setAmount] = useState("");
  const [amountPerPoint, setAmountPerPoint] = useState<number | null>(null);

  useEffect(() => {
    async function fetchRule() {
      try {
        const res = await fetch("/api/dashboard/points-rule");
        if (!res.ok) return;
        const rule: { amountPerPoint: number } | null = await res.json();
        if (rule) {
          setAmountPerPoint(rule.amountPerPoint);
        }
      } catch (err) {
        console.error("[PointsCalculatorPreview] fetch error:", err);
        toast.error("No se pudo cargar la configuración de puntos.");
      }
    }
    fetchRule();
  }, []);

  const points = amount && amountPerPoint ? Math.floor(parseFloat(amount) / amountPerPoint) : 0;

  return (
    <div className="border border-orange-200 bg-white p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Calculadora de puntos</h2>
        <p className="text-sm text-neutral-500">Calcula los puntos que ganará un cliente según su compra</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="calc-amount" className="text-sm font-medium text-orange-700">
          Monto de la compra
        </label>
        <input
          id="calc-amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="10000"
          className="h-9 w-full border border-orange-200 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      <div className="bg-orange-600 text-white p-4 rounded-lg">
        <p className="text-sm text-orange-100 mb-1">Puntos ganados:</p>
        <p className="text-4xl font-bold">{points.toLocaleString()}</p>
      </div>

      <p className="text-xs text-neutral-500">
        * Cada punto equivale a <span className="font-medium text-orange-600">${amountPerPoint || "---"}</span> de compra
      </p>
    </div>
  );
}
