"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface Props {
  negocio: string;
}

export default function LoginForm({ negocio }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dni, setDni] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/tienda/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocio, dni, pin }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/tienda/${negocio}/${data.clientId}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error("[LoginForm] handleLogin error:", err);
      toast.error("No se pudo conectar con el servidor. Verificá tu conexión a internet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dni" className="text-neutral-700 font-medium">DNI</Label>
        <Input
          id="dni"
          type="text"
          placeholder="Tu DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pin" className="text-neutral-700 font-medium">PIN</Label>
        <div className="relative">
          <Input
            id="pin"
            type={showPin ? "text" : "password"}
            placeholder="4-6 dígitos"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 pr-10"
            maxLength={6}
            pattern="\d{4,6}"
            required
          />
          <button
            type="button"
            onClick={() => setShowPin((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            {showPin ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-orange-600 py-2 text-white hover:bg-orange-500 disabled:opacity-50"
      >
        {loading ? "Iniciando..." : "Ingresar"}
      </button>
      <p className="text-center text-sm text-neutral-500">
        ¿No tenés cuenta?{" "}
        <Link href={`/tienda/${negocio}/register`} className="text-orange-600 hover:text-orange-500 font-medium">
          Registrate
        </Link>
      </p>
    </form>
  );
}
