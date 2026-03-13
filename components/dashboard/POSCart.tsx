"use client";

import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  items: CartItem[];
  onUpdateQty: (menuItemId: string, qty: number) => void;
  onRemove: (menuItemId: string) => void;
  onCheckout: () => void;
  canCheckout: boolean;
  noBranchMessage?: string;
}

export default function POSCart({
  items,
  onUpdateQty,
  onRemove,
  onCheckout,
  canCheckout,
  noBranchMessage,
}: Props) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="flex h-full flex-col gap-3">
      <h2 className="text-base font-semibold text-neutral-900">Carrito</h2>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">
            Agregá productos desde la grilla.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div
                key={item.menuItemId}
                className="flex items-center gap-2 rounded-lg border border-orange-100 bg-white p-2.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
                  <p className="text-xs text-neutral-500">
                    ${Number(item.price).toLocaleString("es-AR")} c/u
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onUpdateQty(item.menuItemId, item.quantity - 1)}
                    className="rounded p-1 text-neutral-500 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <FiMinus className="text-xs" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-neutral-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.menuItemId, item.quantity + 1)}
                    className="rounded p-1 text-neutral-500 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <FiPlus className="text-xs" />
                  </button>
                  <button
                    onClick={() => onRemove(item.menuItemId)}
                    className="ml-1 rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 className="text-xs" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-orange-100 pt-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-neutral-700">Total</span>
          <span className="text-lg font-bold text-neutral-900">
            ${total.toLocaleString("es-AR")}
          </span>
        </div>

        {noBranchMessage && (
          <p className="mb-2 text-center text-xs text-neutral-500">{noBranchMessage}</p>
        )}

        <Button
          className="w-full bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-50"
          disabled={!canCheckout || items.length === 0}
          onClick={onCheckout}
        >
          Cobrar
        </Button>
      </div>
    </div>
  );
}
