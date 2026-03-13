"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  negocio: string;
}

export default function RegisterForm({ negocio }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ dni: "", firstName: "", lastName: "", pin: "", pinConfirm: "" });

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (form.pin !== form.pinConfirm) {
      toast.error("Los PIN no coinciden");
      return;
    }

    if (!/^\d{4,6}$/.test(form.pin)) {
      toast.error("El PIN debe tener entre 4 y 6 dígitos");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/tienda/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          negocio,
          dni: form.dni,
          firstName: form.firstName,
          lastName: form.lastName,
          pin: form.pin,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Registro exitoso");
        router.push(`/tienda/${negocio}/${data.id}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Error al registrar");
      }
    } catch (err) {
      console.error("[RegisterForm] handleRegister error:", err);
      toast.error("No se pudo conectar con el servidor. Verificá tu conexión a internet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reg-dni" className="text-neutral-700 font-medium">DNI</Label>
        <Input
          id="reg-dni"
          type="text"
          placeholder="Tu DNI"
          value={form.dni}
          onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-firstName" className="text-neutral-700 font-medium">Nombre</Label>
        <Input
          id="reg-firstName"
          type="text"
          placeholder="Tu nombre"
          value={form.firstName}
          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-lastName" className="text-neutral-700 font-medium">Apellido</Label>
        <Input
          id="reg-lastName"
          type="text"
          placeholder="Tu apellido"
          value={form.lastName}
          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-pin" className="text-neutral-700 font-medium">PIN</Label>
        <Input
          id="reg-pin"
          type="password"
          placeholder="4-6 dígitos"
          value={form.pin}
          onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value }))}
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
          maxLength={6}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-pinConfirm" className="text-neutral-700 font-medium">Repetir PIN</Label>
        <Input
          id="reg-pinConfirm"
          type="password"
          placeholder="Repite tu PIN"
          value={form.pinConfirm}
          onChange={(e) => setForm((f) => ({ ...f, pinConfirm: e.target.value }))}
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400"
          maxLength={6}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-orange-600 py-2 text-white hover:bg-orange-500 disabled:opacity-50"
      >
        {loading ? "Registrando..." : "Registrarse"}
      </button>
      <p className="text-center text-sm text-neutral-500">
        ¿Ya tenés cuenta?{" "}
        <Link href={`/tienda/${negocio}/login`} className="text-orange-600 hover:text-orange-500 font-medium">
          Iniciá sesión
        </Link>
      </p>
    </form>
  );
}
