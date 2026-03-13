"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FiTag } from "react-icons/fi";

interface CouponAssignment {
  id: string;
  coupon: {
    id: string;
    name: string;
    type: string;
    value: number | null;
    customDescription: string | null;
    expiresAt: string | null;
  };
}

export default function CuponesTab({ clientId }: { clientId: string }) {
  const [assignments, setAssignments] = useState<CouponAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboard/coupons/client/${clientId}`)
      .then((r) => r.json())
      .then((data) => setAssignments(Array.isArray(data) ? data : []))
      .catch((e) => {
        toast.error("Error al cargar cupones.");
        console.error("[CuponesTab] fetch error:", e);
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) return <p className="text-sm text-neutral-500">Cargando cupones...</p>;

  if (assignments.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <FiTag className="mx-auto mb-2 text-2xl text-neutral-400" />
        <p className="text-sm text-neutral-500">El cliente no tiene cupones disponibles.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {assignments.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4"
        >
          <div>
            <p className="text-sm font-medium text-neutral-900">{a.coupon.name}</p>
            <p className="text-xs text-neutral-500">
              {a.coupon.type === "PERCENTAGE" && a.coupon.value != null
                ? `${a.coupon.value}% de descuento`
                : a.coupon.type === "FIXED_AMOUNT" && a.coupon.value != null
                ? `$${a.coupon.value} de descuento`
                : a.coupon.type === "FREE_PRODUCT"
                ? "Producto gratis"
                : a.coupon.customDescription ?? a.coupon.type}
            </p>
            {a.coupon.expiresAt && (
              <p className="text-xs text-neutral-400">
                Vence: {new Date(a.coupon.expiresAt).toLocaleDateString("es-AR")}
              </p>
            )}
          </div>
          <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600">
            Disponible
          </span>
        </div>
      ))}
    </div>
  );
}
