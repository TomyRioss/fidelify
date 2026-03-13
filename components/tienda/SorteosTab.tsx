"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FiAward } from "react-icons/fi";

interface Raffle {
  id: string;
  name: string;
  description: string | null;
  prize: string;
  closingDate: string;
  participationType: "FREE" | "POINTS_COST";
  pointsCost: number | null;
  executed: boolean;
  alreadyEntered: boolean;
}

interface Props {
  clientId: string;
  clientPoints: number;
  onPointsChange: (pts: number) => void;
}

export default function SorteosTab({ clientId, clientPoints, onPointsChange }: Props) {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/sorteos?clientId=${clientId}`)
      .then((r) => r.json())
      .then((data) => {
        const now = new Date();
        const active = (Array.isArray(data) ? data : []).filter(
          (r: Raffle) => !r.executed && new Date(r.closingDate) > now
        );
        setRaffles(active);
      })
      .catch((e) => {
        toast.error("Error al cargar sorteos.");
        console.error("[SorteosTab] fetch error:", e);
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  async function handleJoin(raffle: Raffle) {
    setJoining(raffle.id);
    try {
      const res = await fetch(`/api/dashboard/sorteos/${raffle.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Inscripto al sorteo correctamente.");
        setRaffles((prev) =>
          prev.map((r) => (r.id === raffle.id ? { ...r, alreadyEntered: true } : r))
        );
        if (raffle.participationType === "POINTS_COST" && raffle.pointsCost) {
          onPointsChange(clientPoints - raffle.pointsCost);
        }
      } else {
        toast.error(data.error ?? "Error al inscribirse.");
        console.error("[SorteosTab] join error:", data);
      }
    } catch (e) {
      toast.error("Error de red al inscribirse.");
      console.error("[SorteosTab] network error:", e);
    } finally {
      setJoining(null);
    }
  }

  if (loading) return <p className="text-sm text-neutral-500">Cargando sorteos...</p>;

  if (raffles.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <FiAward className="mx-auto mb-2 text-2xl text-neutral-400" />
        <p className="text-sm text-neutral-500">No hay sorteos activos.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {raffles.map((raffle) => {
        const canJoin =
          !raffle.alreadyEntered &&
          (raffle.participationType === "FREE" ||
            (raffle.pointsCost != null && clientPoints >= raffle.pointsCost));
        return (
          <div
            key={raffle.id}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">{raffle.name}</p>
              {raffle.description && (
                <p className="text-xs text-neutral-500">{raffle.description}</p>
              )}
              <p className="mt-1 text-xs text-neutral-400">
                Cierra: {new Date(raffle.closingDate).toLocaleDateString("es-AR")}
                {raffle.participationType === "POINTS_COST" && raffle.pointsCost
                  ? ` · Costo: ${raffle.pointsCost} pts`
                  : " · Gratis"}
              </p>
            </div>
            {raffle.alreadyEntered ? (
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
                Ya inscripto
              </span>
            ) : (
              <button
                onClick={() => handleJoin(raffle)}
                disabled={!canJoin || joining === raffle.id}
                className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {joining === raffle.id ? "Inscribiendo..." : "Participar"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
