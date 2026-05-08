"use client";

import { useState } from "react";
import { FiEye, FiEyeOff, FiUser, FiLink, FiUserPlus } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "idle" | "found" | "new";

interface FoundGlobal {
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

export default function ClientForm() {
  const router = useRouter();
  const [dni, setDni] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [foundGlobal, setFoundGlobal] = useState<FoundGlobal | null>(null);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [newForm, setNewForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    pin: "",
  });

  async function handleSearch() {
    if (!dni.trim()) {
      toast.error("Ingresá un DNI.");
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/dashboard/clients/by-dni?dni=${encodeURIComponent(dni.trim())}`);
      if (res.status === 404) {
        setStep("new");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al buscar el cliente.");
      }
      const data = await res.json();
      if (data.alreadyAffiliated) {
        toast.error("Este cliente ya está afiliado a tu negocio.");
        return;
      }
      setFoundGlobal({
        dni: data.dni,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      });
      setStep("found");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[ClientForm] handleSearch error:", err);
      toast.error(message);
    } finally {
      setSearching(false);
    }
  }

  async function handleLink() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: dni.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al vincular el cliente.");
      }
      router.push("/dashboard/clientes");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[ClientForm] handleLink error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newForm.firstName) {
      toast.error("El nombre es requerido.");
      return;
    }
    if (!newForm.email?.trim()) {
      toast.error("El email es requerido.");
      return;
    }
    if (!newForm.pin || newForm.pin.length < 4) {
      toast.error("PIN de al menos 4 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: dni.trim(),
          firstName: newForm.firstName,
          lastName: newForm.lastName,
          phone: newForm.phone || null,
          email: newForm.email,
          pin: newForm.pin,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al crear el cliente.");
      }
      router.push("/dashboard/clientes");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[ClientForm] handleCreate error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function resetDni() {
    setStep("idle");
    setFoundGlobal(null);
    setNewForm({ firstName: "", lastName: "", phone: "", email: "", pin: "" });
  }

  return (
    <div className="border border-orange-200 bg-white p-6 flex flex-col gap-6">

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-600 text-white text-xs font-bold shrink-0">
          {step === "idle" ? "1" : "2"}
        </span>
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            {step === "idle" && "Verificar DNI"}
            {step === "found" && "Vincular cuenta existente"}
            {step === "new" && "Crear cuenta nueva"}
          </p>
          <p className="text-xs text-neutral-500">
            {step === "idle" && "Paso 1 de 2"}
            {step !== "idle" && "Paso 2 de 2"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-neutral-100 rounded-full">
        <div
          className={`h-1 bg-orange-500 rounded-full transition-all duration-300 ${step === "idle" ? "w-1/2" : "w-full"}`}
        />
      </div>

      {/* STEP 1 — idle */}
      {step === "idle" && (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-neutral-600">
            Ingresá el DNI del cliente. Verificamos si ya tiene cuenta en FidelyAI.
          </p>

          {/* DNI input */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dni" className="text-neutral-700 font-medium">DNI *</Label>
            <div className="flex gap-2">
              <Input
                id="dni"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                placeholder="12345678"
                className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
              />
              <Button
                type="button"
                className="bg-orange-600 text-white hover:bg-orange-500 shrink-0"
                onClick={handleSearch}
                disabled={searching}
              >
                {searching ? "Buscando..." : "Continuar"}
              </Button>
            </div>
          </div>

          {/* Outcome preview cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-orange-100 bg-orange-50 p-3 rounded flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <FiLink size={14} className="text-orange-500 shrink-0" />
                <span className="text-xs font-semibold text-orange-700">Cuenta existente</span>
              </div>
              <p className="text-xs text-neutral-500 leading-snug">
                Se vincula al negocio en un clic, sin necesidad de PIN.
              </p>
            </div>
            <div className="border border-neutral-200 bg-neutral-50 p-3 rounded flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <FiUserPlus size={14} className="text-neutral-500 shrink-0" />
                <span className="text-xs font-semibold text-neutral-700">Cuenta nueva</span>
              </div>
              <p className="text-xs text-neutral-500 leading-snug">
                Se completan los datos y se crea la cuenta con PIN.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 — found: existing global account */}
      {step === "found" && foundGlobal && (
        <div className="flex flex-col gap-4">
          <div className="border border-orange-300 bg-orange-50 p-4 rounded flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
              <FiUser size={15} className="text-orange-600" />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-neutral-900 font-semibold text-sm">
                {foundGlobal.firstName} {foundGlobal.lastName}
              </p>
              <p className="text-neutral-500 text-xs">{foundGlobal.email}</p>
              {foundGlobal.phone && (
                <p className="text-neutral-500 text-xs">{foundGlobal.phone}</p>
              )}
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-orange-600 font-medium">
                <FiLink size={11} /> Cuenta FidelyAI verificada
              </span>
            </div>
          </div>

          <p className="text-sm text-neutral-600">
            Al vincularlo, este cliente podrá acumular y canjear puntos en tu negocio usando su cuenta existente.
          </p>

          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              className="bg-white border border-orange-300 text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
              onClick={resetDni}
              disabled={loading}
            >
              Cambiar DNI
            </Button>
            <Button
              type="button"
              className="bg-orange-600 text-white hover:bg-orange-500"
              onClick={handleLink}
              disabled={loading}
            >
              {loading ? "Vinculando..." : "Vincular cliente"}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 — new: create global account */}
      {step === "new" && (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-neutral-600">
            No existe cuenta con DNI <span className="font-semibold text-neutral-800">{dni}</span>. Completá los datos para crear la cuenta del cliente.
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-neutral-700 font-medium">Email *</Label>
            <Input
              id="email"
              type="email"
              value={newForm.email}
              onChange={(e) => setNewForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="cliente@email.com"
              className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="firstName" className="text-neutral-700 font-medium">Nombre *</Label>
            <Input
              id="firstName"
              value={newForm.firstName}
              onChange={(e) => setNewForm((f) => ({ ...f, firstName: e.target.value }))}
              placeholder="Juan"
              className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lastName" className="text-neutral-700 font-medium">Apellido</Label>
            <Input
              id="lastName"
              value={newForm.lastName}
              onChange={(e) => setNewForm((f) => ({ ...f, lastName: e.target.value }))}
              placeholder="Pérez"
              className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone" className="text-neutral-700 font-medium">Teléfono</Label>
            <Input
              id="phone"
              value={newForm.phone}
              onChange={(e) => setNewForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+54 11 0000-0000"
              className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pin" className="text-neutral-700 font-medium">PIN (cuenta del cliente) *</Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                value={newForm.pin}
                onChange={(e) => setNewForm((f) => ({ ...f, pin: e.target.value }))}
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

          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              className="bg-white border border-orange-300 text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
              onClick={resetDni}
              disabled={loading}
            >
              Cambiar DNI
            </Button>
            <Button
              type="button"
              className="bg-orange-600 text-white hover:bg-orange-500"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Registrar cliente"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
