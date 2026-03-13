"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RestaurantSettings = {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
};

export default function BusinessSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RestaurantSettings>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/dashboard/restaurant-settings");
        if (!res.ok) throw new Error("Error al cargar configuración");
        const data = await res.json();
        setForm({
          name: data.name,
          email: data.email,
          phone: data.phone ?? "",
          address: data.address ?? "",
        });
      } catch (err) {
        console.error("[BusinessSettingsCard] fetch error:", err);
        toast.error("Error al cargar configuración");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/restaurant-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al guardar");
      }
      toast.success("Datos del negocio actualizados");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado";
      console.error("[BusinessSettingsCard] submit error:", err);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="border border-orange-200 bg-white p-6">
        <div className="h-6 w-32 bg-orange-50 animate-pulse rounded mb-4" />
        <div className="space-y-3">
          <div className="h-9 bg-orange-50 animate-pulse rounded" />
          <div className="h-9 bg-orange-50 animate-pulse rounded" />
          <div className="h-9 bg-orange-50 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="border border-orange-200 bg-white p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Datos del negocio</h2>
        <p className="text-sm text-neutral-500">Configura la información de tu local</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-orange-700">Nombre del local *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Mi Negocio"
          className="text-neutral-900 border-orange-200 focus:ring-orange-300"
          disabled={saving}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-orange-700">Email (no editable)</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          disabled
          className="text-neutral-500 bg-orange-50 border-orange-200"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone" className="text-orange-700">Teléfono</Label>
        <Input
          id="phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+54 11 0000-0000"
          className="text-neutral-900 border-orange-200 focus:ring-orange-300"
          disabled={saving}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address" className="text-orange-700">Dirección</Label>
        <Input
          id="address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          placeholder="Av. Corrientes 1234"
          className="text-neutral-900 border-orange-200 focus:ring-orange-300"
          disabled={saving}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          className="bg-orange-600 text-white hover:bg-orange-500"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
