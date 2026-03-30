"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FiClock } from "react-icons/fi";

interface Redemption {
  id: string;
  productName: string;
  pointsSpent: number;
  createdAt: string;
}

interface Props {
  clientId: string;
}

export default function HistorialCanjes({ clientId }: Props) {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tienda/redemptions?clientId=${clientId}`)
      .then((r) => r.json())
      .then((data) => setRedemptions(Array.isArray(data.redemptions) ? data.redemptions : []))
      .catch((e) => {
        toast.error("Error al cargar el historial.");
        console.error("[HistorialCanjes] fetch error:", e);
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-2 mb-1">
        <FiClock className="text-orange-500 text-lg" />
        <h2 className="text-base font-semibold text-neutral-900">Historial de canjes</h2>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando historial...</p>
      ) : redemptions.length === 0 ? (
        <div className="rounded-xl border border-orange-200 bg-white p-6 text-center">
          <p className="text-sm text-neutral-500">Todavía no realizaste ningún canje.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {redemptions.map((r) => {
            const code = r.id.slice(0, 8).toUpperCase();
            const date = new Date(r.createdAt).toLocaleString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div
                key={r.id}
                className="rounded-xl border border-orange-200 bg-white p-4 flex flex-col gap-1"
              >
                <p className="text-sm font-semibold text-neutral-900">{r.productName}</p>
                <p className="font-mono text-lg font-bold tracking-widest text-orange-600">{code}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-neutral-500">{date}</p>
                  <p className="text-xs font-semibold text-orange-500">
                    -{r.pointsSpent.toLocaleString()} pts
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
