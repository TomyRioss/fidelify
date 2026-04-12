"use client";

import { useState } from "react";
import { FiMapPin } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  id: string;
  name: string;
  address?: string | null;
  onAfiliar: (restaurantId: string) => Promise<void>;
}

export default function LocalRecomendadoCard({ id, name, address, onAfiliar }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleAfiliar() {
    setLoading(true);
    try {
      await onAfiliar(id);
      toast.success(`Te adheriste a ${name}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al adherirse.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full border-2 border-orange-200 rounded-xl p-4 bg-white flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-neutral-900">{name}</p>
        {address && (
          <p className="flex items-center gap-1 text-sm text-neutral-500 mt-3">
            <FiMapPin className="shrink-0 text-orange-500" />
            {address}
          </p>
        )}
      </div>
      <Button
        onClick={handleAfiliar}
        disabled={loading}
        className="shrink-0 bg-orange-600 hover:bg-orange-500 text-white text-sm h-9 px-3"
      >
        {loading ? "..." : "Adherirme +"}
      </Button>
    </div>
  );
}
