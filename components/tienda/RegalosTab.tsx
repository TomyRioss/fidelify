"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FiGift } from "react-icons/fi";

interface Milestone {
  id: string;
  visitTrigger: number;
  giftType: string;
  description: string;
  eligible: boolean;
  delivered: boolean;
}

interface Props {
  clientId: string;
  visitCount: number;
}

export default function RegalosTab({ clientId }: Props) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [delivering, setDelivering] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/gifts/client/${clientId}`)
      .then((r) => r.json())
      .then((data) => setMilestones(data.milestones ?? []))
      .catch((e) => {
        toast.error("Error al cargar regalos.");
        console.error("[RegalosTab] fetch error:", e);
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  async function handleDeliver(milestoneId: string) {
    setDelivering(milestoneId);
    try {
      const res = await fetch(`/api/dashboard/gifts/${milestoneId}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Regalo entregado correctamente.");
        setMilestones((prev) =>
          prev.map((m) => (m.id === milestoneId ? { ...m, delivered: true } : m))
        );
      } else {
        toast.error(data.error ?? "Error al entregar regalo.");
        console.error("[RegalosTab] deliver error:", data);
      }
    } catch (e) {
      toast.error("Error de red al entregar regalo.");
      console.error("[RegalosTab] network error:", e);
    } finally {
      setDelivering(null);
    }
  }

  if (loading) return <p className="text-sm text-neutral-500">Cargando regalos...</p>;

  if (milestones.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <FiGift className="mx-auto mb-2 text-2xl text-neutral-400" />
        <p className="text-sm text-neutral-500">No hay hitos de regalo configurados.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {milestones.map((m) => (
        <div
          key={m.id}
          className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4"
        >
          <div>
            <p className="text-sm font-medium text-neutral-900">{m.description}</p>
            <p className="text-xs text-neutral-500">Requiere {m.visitTrigger} visitas · {m.giftType}</p>
          </div>
          {m.delivered ? (
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
              Entregado
            </span>
          ) : m.eligible ? (
            <button
              onClick={() => handleDeliver(m.id)}
              disabled={delivering === m.id}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
            >
              {delivering === m.id ? "Entregando..." : "Entregar"}
            </button>
          ) : (
            <span className="text-xs text-neutral-400">No elegible</span>
          )}
        </div>
      ))}
    </div>
  );
}
