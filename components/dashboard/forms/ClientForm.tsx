"use client";

import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  clientId?: string;
  canManagePin?: boolean;
  defaultValues?: {
    dni?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    pin?: string;
  };
};

export default function ClientForm({ clientId, canManagePin, defaultValues }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    dni: defaultValues?.dni ?? "",
    firstName: defaultValues?.firstName ?? "",
    lastName: defaultValues?.lastName ?? "",
    phone: defaultValues?.phone ?? "",
    email: defaultValues?.email ?? "",
    pin: defaultValues?.pin ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  async function handleSubmit() {
    if (!form.firstName) {
      toast.error("El nombre es requerido.");
      return;
    }
    if (!clientId && !form.dni) {
      toast.error("El DNI es requerido.");
      return;
    }
    setLoading(true);
    try {
      if (clientId) {
        const res = await fetch(`/api/dashboard/clients/${clientId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName || "",
            phone: form.phone || null,
            email: form.email || null,
            ...(canManagePin && form.pin !== "" ? { pin: form.pin } : {}),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al actualizar el cliente.");
        }
      } else {
        const res = await fetch("/api/dashboard/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dni: form.dni,
            firstName: form.firstName,
            lastName: form.lastName || "",
            phone: form.phone || null,
            email: form.email || null,
            ...(canManagePin ? { pin: form.pin || null } : {}),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al crear el cliente.");
        }
      }
      router.push("/dashboard/clientes");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[ClientForm] handleSubmit error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-orange-200 bg-white p-6 flex flex-col gap-5">
      {!clientId && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dni" className="text-neutral-700 font-medium">DNI *</Label>
          <Input
            id="dni"
            value={form.dni}
            onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
            placeholder="12345678"
            className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
          />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="firstName" className="text-neutral-700 font-medium">Nombre *</Label>
        <Input
          id="firstName"
          value={form.firstName}
          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          placeholder="Juan"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lastName" className="text-neutral-700 font-medium">Apellido</Label>
        <Input
          id="lastName"
          value={form.lastName}
          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
          placeholder="Pérez"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone" className="text-neutral-700 font-medium">Teléfono</Label>
        <Input
          id="phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+54 11 0000-0000"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-neutral-700 font-medium">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="cliente@email.com"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      {canManagePin && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pin" className="text-neutral-700 font-medium">PIN</Label>
          <div className="relative">
            <Input
              id="pin"
              type={showPin ? "text" : "password"}
              value={form.pin}
              onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value }))}
              placeholder="****"
              className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPin((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPin ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          className="bg-white border border-orange-300 text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
          onClick={() => router.push("/dashboard/clientes")}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          className="bg-orange-600 text-white hover:bg-orange-500"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Guardando..." : clientId ? "Guardar cambios" : "Registrar cliente"}
        </Button>
      </div>
    </div>
  );
}
