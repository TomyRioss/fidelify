"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FiShoppingBag, FiCheckCircle } from "react-icons/fi";

interface Product {
  id: string;
  name: string;
  description: string | null;
  pointCost: number;
  active: boolean;
  imageUrl: string | null;
}

interface Receipt {
  id: string;
  productName: string;
  pointsSpent: number;
  createdAt: string;
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
  const [receipt, setReceipt] = useState<Receipt | null>(null);

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
        onPointsChange(client.points - product.pointCost);
        setReceipt(data.redemption);
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
      <div className="rounded-xl border border-orange-200 bg-white p-8 text-center">
        <FiShoppingBag className="mx-auto mb-2 text-2xl text-neutral-400" />
        <p className="text-sm text-neutral-500">No hay productos en la tienda.</p>
      </div>
    );
  }

  if (receipt) {
    const code = receipt.id.slice(0, 8).toUpperCase();
    const date = new Date(receipt.createdAt).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-orange-200 bg-white p-8 text-center shadow-sm">
        <FiCheckCircle className="text-6xl text-orange-500" />
        <div className="flex flex-col gap-1">
          <p className="text-xl font-bold text-neutral-900">{receipt.productName}</p>
          <p className="text-sm text-neutral-500">Canje realizado el {date}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-neutral-500">Código de comprobante</p>
          <p className="font-mono text-3xl font-bold tracking-widest text-orange-600">{code}</p>
        </div>
        <p className="text-sm font-semibold text-neutral-700">
          {receipt.pointsSpent.toLocaleString()} puntos descontados
        </p>
        <p className="max-w-xs text-sm text-neutral-500">
          Mostrá este comprobante al empleado para obtener tu beneficio.
        </p>
        <button
          onClick={() => setReceipt(null)}
          className="rounded-lg border-2 border-orange-300 bg-orange-50 px-6 py-2.5 text-sm font-medium text-orange-700 hover:bg-orange-100"
        >
          Volver a la tienda
        </button>
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
            className="flex items-center justify-between rounded-xl border-2 border-orange-200 bg-white p-5 shadow-sm gap-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              {product.imageUrl && (
                <div className="relative w-14 h-14 rounded-lg border border-orange-100 overflow-hidden shrink-0">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="56px" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-base font-semibold text-neutral-900">{product.name}</p>
                {product.description && (
                  <p className="mt-0.5 text-sm text-neutral-500">{product.description}</p>
                )}
                <p className="mt-2 text-sm font-bold text-orange-600">
                  {product.pointCost.toLocaleString()} puntos
                </p>
              </div>
            </div>
            <button
              onClick={() => handleRedeem(product)}
              disabled={!canRedeem || redeeming === product.id}
              className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {redeeming === product.id ? "Canjeando..." : "Canjear"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
