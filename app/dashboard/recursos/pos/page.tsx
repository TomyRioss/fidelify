"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useBranch } from "@/lib/branch-context";
import POSProductGrid, { POSProduct } from "@/components/dashboard/POSProductGrid";
import POSCart, { CartItem } from "@/components/dashboard/POSCart";
import POSCheckout from "@/components/dashboard/POSCheckout";

export default function POSPage() {
  const { activeBranch } = useBranch();
  const [products, setProducts] = useState<POSProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/menu-items");
      if (!res.ok) throw new Error("Error al cargar productos.");
      const data = await res.json();
      setProducts(data.filter((p: POSProduct & { active?: boolean }) => p.active !== false));
    } catch (err) {
      console.error("[POSPage] fetch error:", err);
      toast.error("Error al cargar el catálogo de productos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function addToCart(product: POSProduct) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  }

  function updateQty(menuItemId: string, qty: number) {
    if (qty <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: qty } : i))
    );
  }

  function removeFromCart(menuItemId: string) {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const canCheckout = Boolean(activeBranch);
  const noBranchMessage = !activeBranch
    ? "Seleccioná una sucursal para operar."
    : undefined;

  function handleCheckoutConfirmed(_result: { pointsEarned: number; clientPoints: number }) {
    setShowCheckout(false);
    setCart([]);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-0 overflow-hidden">
      <div className="flex items-center border-b border-orange-100 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-neutral-900">Punto de Venta</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="py-12 text-center text-sm text-neutral-500">Cargando productos...</p>
          ) : (
            <POSProductGrid products={products} onAdd={addToCart} />
          )}
        </div>

        {/* Cart */}
        <div className="w-72 shrink-0 border-l border-orange-100 bg-orange-50/30 p-4 flex flex-col overflow-hidden">
          <POSCart
            items={cart}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
            onCheckout={() => setShowCheckout(true)}
            canCheckout={canCheckout}
            noBranchMessage={noBranchMessage}
          />
        </div>
      </div>

      {showCheckout && activeBranch && (
        <POSCheckout
          items={cart}
          branchId={activeBranch.id}
          total={total}
          onClose={() => setShowCheckout(false)}
          onConfirmed={handleCheckoutConfirmed}
        />
      )}
    </div>
  );
}
