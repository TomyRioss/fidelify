"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PointsRule = {
  id: string;
  amountPerPoint: number;
  active: boolean;
} | null;

type FormState = {
  amountPerPoint: string;
  active: boolean;
  hasRule: boolean;
  ruleId: string | null;
};

export default function PointsRuleCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    amountPerPoint: "",
    active: true,
    hasRule: false,
    ruleId: null,
  });

  useEffect(() => {
    async function fetchRule() {
      try {
        const res = await fetch("/api/dashboard/points-rule");
        if (!res.ok) throw new Error("Error al cargar regla de puntos");
        const rule: PointsRule = await res.json();
        if (rule) {
          setForm({
            amountPerPoint: rule.amountPerPoint.toString(),
            active: rule.active,
            hasRule: true,
            ruleId: rule.id,
          });
        } else {
          setForm({
            amountPerPoint: "",
            active: true,
            hasRule: false,
            ruleId: null,
          });
        }
      } catch (err) {
        console.error("[PointsRuleCard] fetch error:", err);
        toast.error("Error al cargar configuración de puntos");
      } finally {
        setLoading(false);
      }
    }
    fetchRule();
  }, []);

  async function handleSubmit() {
    const amount = parseFloat(form.amountPerPoint);
    if (isNaN(amount) || amount < 0.01 || amount > 1000000) {
      toast.error("El monto debe ser entre 0.01 y 1,000,000");
      return;
    }

    setSaving(true);
    try {
      if (form.hasRule && form.ruleId) {
        const res = await fetch(`/api/dashboard/points-rule/${form.ruleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountPerPoint: amount, active: form.active }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al actualizar regla");
        }
        toast.success("Regla de puntos actualizada");
      } else {
        const res = await fetch("/api/dashboard/points-rule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountPerPoint: amount, active: form.active }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al crear regla");
        }
        const newRule = await res.json();
        setForm((f) => ({ ...f, hasRule: true, ruleId: newRule.id }));
        toast.success("Regla de puntos creada");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      console.error("[PointsRuleCard] submit error:", err);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const previewPoints = form.amountPerPoint ? Math.floor(10000 / parseFloat(form.amountPerPoint)) : 0;

  if (loading) {
    return (
      <div className="border border-orange-200 bg-white p-6">
        <div className="h-6 w-32 bg-orange-50 animate-pulse rounded mb-4" />
        <div className="space-y-3">
          <div className="h-9 bg-orange-50 animate-pulse rounded" />
          <div className="h-9 bg-orange-50 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="border border-orange-200 bg-white p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Sistema de puntos</h2>
        <p className="text-sm text-neutral-500">Configura cuánto equivale cada punto</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amountPerPoint" className="text-orange-700">Monto por cada punto *</Label>
        <Input
          id="amountPerPoint"
          type="number"
          min="0.01"
          max="1000000"
          step="0.01"
          value={form.amountPerPoint}
          onChange={(e) => setForm((f) => ({ ...f, amountPerPoint: e.target.value }))}
          placeholder="100"
          className="text-neutral-900 border-orange-200 focus:ring-orange-300"
          disabled={saving}
        />
        <p className="text-xs text-neutral-500">
          Ingrese el monto en pesos que un cliente debe gastar para ganar 1 punto
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="active"
          checked={form.active}
          onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
          disabled={saving}
          className="h-4 w-4 accent-orange-600 cursor-pointer"
        />
        <Label htmlFor="active" className="cursor-pointer text-neutral-700">
          Sistema de puntos activo
        </Label>
      </div>

      {form.amountPerPoint && form.active && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <p className="text-sm text-neutral-700">
            Si el cliente compra <span className="font-semibold text-orange-600">$10,000</span>, recibe{" "}
            <span className="font-semibold text-orange-600">{previewPoints} puntos</span>
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button
          className="bg-orange-600 text-white hover:bg-orange-500"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Guardando..." : form.hasRule ? "Actualizar regla" : "Crear regla"}
        </Button>
      </div>
    </div>
  );
}
