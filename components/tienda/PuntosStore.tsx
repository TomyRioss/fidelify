"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FiShoppingBag } from "react-icons/fi";

interface Product {
  id: string;
  name: string;
  description: string | null;
  pointCost: number;
  active: boolean;
}

interface Client {
  id: string;
  points: number;
}

interface Props {
  client: Client;
  onPointsChange: (newPoints: number) => void;
}

export default function PuntosStore({ client, onPointsChange }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/catalog")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data.products) ? data.products : data))
      .catch((e) => {
        toast.error("Error al cargar productos.");
        console.error("[PuntosStore] fetch error:", e);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleRedeem(product: Product) {
    setRedeeming(product.id);
    try {
      const res = await fetch(`/api/tienda/catalog/${product.id}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`"${product.name}" canjeado correctamente.`);
        onPointsChange(client.points - product.pointCost);
      } else {
        toast.error(data.error ?? "Error al canjear.");
        console.error("[PuntosStore] redeem error:", data);
      }
    } catch (e) {
      toast.error("Error de red al canjear.");
      console.error("[PuntosStore] network error:", e);
    } finally {
      setRedeeming(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando productos...</p>;
  }

  const activeProducts = products.filter((p) => p.active);

  if (activeProducts.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <FiShoppingBag className="mx-auto mb-2 text-2xl text-neutral-400" />
        <p className="text-sm text-neutral-500">No hay productos en la tienda.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {activeProducts.map((product) => {
        const canRedeem = client.points >= product.pointCost;
        return (
          <div
            key={product.id}
            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">{product.name}</p>
              {product.description && (
                <p className="text-xs text-neutral-500">{product.description}</p>
              )}
              <p className="mt-1 text-xs font-semibold text-neutral-700">
                {product.pointCost.toLocaleString()} puntos
              </p>
            </div>
            <button
              onClick={() => handleRedeem(product)}
              disabled={!canRedeem || redeeming === product.id}
              className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {redeeming === product.id ? "Canjeando..." : "Canjear"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
