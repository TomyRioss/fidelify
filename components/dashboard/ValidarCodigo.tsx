"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiSearch, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RedemptionResult {
  id: string;
  code: string;
  productName: string;
  pointsSpent: number;
  createdAt: string;
  clientName: string;
  clientDni: string;
}

export default function ValidarCodigo() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RedemptionResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  async function handleValidar() {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 8) {
      toast.error("El código debe tener exactamente 8 caracteres.");
      return;
    }

    setLoading(true);
    setResult(null);
    setNotFound(false);

    try {
      const res = await fetch(`/api/dashboard/validar?code=${trimmed}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setNotFound(true);
        } else {
          toast.error(data.error ?? "Error al validar el código.");
        }
        return;
      }

      setResult(data.redemption);
    } catch (err) {
      console.error("[ValidarCodigo] fetch error:", err);
      toast.error("Error de conexión al validar el código.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleValidar();
  }

  function handleReset() {
    setCode("");
    setResult(null);
    setNotFound(false);
  }

  return (
    <div className="px-6 pb-6 flex flex-col gap-6">
      {/* Search bar */}
      <div className="flex gap-3">
        <Input
          placeholder="Ingresá el código (8 caracteres)"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase().slice(0, 8));
            setResult(null);
            setNotFound(false);
          }}
          onKeyDown={handleKeyDown}
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400 font-mono tracking-widest text-base uppercase max-w-xs"
        />
        <Button
          onClick={handleValidar}
          disabled={loading || code.trim().length === 0}
          className="bg-orange-600 text-white hover:bg-orange-500"
        >
          <FiSearch className="mr-2" />
          {loading ? "Validando..." : "Validar"}
        </Button>
        {(result || notFound) && (
          <Button
            onClick={handleReset}
            className="bg-white border border-orange-300 text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Not found */}
      {notFound && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
          <FiXCircle className="text-red-500 text-2xl shrink-0" />
          <div>
            <p className="font-semibold text-red-700">Código no encontrado</p>
            <p className="text-sm text-red-500 mt-0.5">
              El código <span className="font-mono font-bold">{code}</span> no corresponde a ningún canje registrado.
            </p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="flex items-start gap-4 rounded-xl border border-orange-200 bg-white p-6">
          <FiCheckCircle className="text-orange-500 text-3xl shrink-0 mt-0.5" />
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-lg font-bold text-neutral-900">{result.productName}</p>
              <span className="font-mono text-xl font-bold tracking-widest text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1">
                {result.code}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-neutral-500 text-xs uppercase tracking-wide font-medium mb-0.5">Cliente</p>
                <p className="text-neutral-900 font-semibold">{result.clientName}</p>
                <p className="text-neutral-500">DNI: {result.clientDni}</p>
              </div>
              <div>
                <p className="text-neutral-500 text-xs uppercase tracking-wide font-medium mb-0.5">Puntos canjeados</p>
                <p className="text-orange-600 font-bold text-base">-{result.pointsSpent.toLocaleString()} pts</p>
              </div>
              <div>
                <p className="text-neutral-500 text-xs uppercase tracking-wide font-medium mb-0.5">Fecha</p>
                <p className="text-neutral-900">
                  {new Date(result.createdAt).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
