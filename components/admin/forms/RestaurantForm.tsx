"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SubscriptionStatus = "TRIAL" | "ACTIVE" | "INACTIVE";

type Props = {
  restaurantId?: string;
  defaultValues?: {
    name?: string;
    email?: string;
    slug?: string;
    phone?: string;
    address?: string;
    subscriptionStatus?: string;
  };
};

export default function RestaurantForm({ restaurantId, defaultValues }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: defaultValues?.name ?? "",
    email: defaultValues?.email ?? "",
    slug: defaultValues?.slug ?? "",
    phone: defaultValues?.phone ?? "",
    address: defaultValues?.address ?? "",
    subscriptionStatus: (defaultValues?.subscriptionStatus as SubscriptionStatus) ?? "TRIAL",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.name || !form.email || !form.slug) {
      toast.error("Nombre, email y slug son requeridos.");
      return;
    }
    if (!restaurantId && (!form.adminName || !form.adminEmail || !form.adminPassword)) {
      toast.error("Nombre, email y contraseña del owner son requeridos.");
      return;
    }
    setLoading(true);
    try {
      const bodyData: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        slug: form.slug,
        phone: form.phone || null,
        address: form.address || null,
        subscriptionStatus: form.subscriptionStatus,
      };
      if (!restaurantId) {
        bodyData.adminName = form.adminName;
        bodyData.adminEmail = form.adminEmail;
        bodyData.adminPassword = form.adminPassword;
      }
      const url = restaurantId ? `/api/admin/restaurants/${restaurantId}` : "/api/admin/restaurants";
      const method = restaurantId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al guardar el negocio.");
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[RestaurantForm] handleSubmit error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-neutral-200 bg-white p-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nombre *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Mi Negocio"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="negocio@email.com"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          placeholder="mi-negocio"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+54 11 0000-0000"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          placeholder="Av. Corrientes 1234"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subscriptionStatus">Estado suscripción</Label>
        <Select
          value={form.subscriptionStatus}
          onValueChange={(v) => setForm((f) => ({ ...f, subscriptionStatus: v as SubscriptionStatus }))}
        >
          <SelectTrigger id="subscriptionStatus">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TRIAL">TRIAL</SelectItem>
            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
            <SelectItem value="INACTIVE">INACTIVE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {!restaurantId && (
        <>
          <div className="border-t border-neutral-100 pt-2">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Owner del negocio</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="adminName">Nombre *</Label>
            <Input
              id="adminName"
              value={form.adminName}
              onChange={(e) => setForm((f) => ({ ...f, adminName: e.target.value }))}
              placeholder="Juan Pérez"
              className="text-neutral-900"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="adminEmail">Email *</Label>
            <Input
              id="adminEmail"
              type="email"
              value={form.adminEmail}
              onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))}
              placeholder="admin@negocio.com"
              className="text-neutral-900"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="adminPassword">Contraseña *</Label>
            <Input
              id="adminPassword"
              type="password"
              value={form.adminPassword}
              onChange={(e) => setForm((f) => ({ ...f, adminPassword: e.target.value }))}
              placeholder="••••••••"
              className="text-neutral-900"
            />
          </div>
        </>
      )}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="outline"
          className="border-neutral-300 text-neutral-700"
          onClick={() => router.push("/admin/dashboard")}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          className="bg-neutral-900 text-white hover:bg-neutral-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Guardando..." : restaurantId ? "Guardar cambios" : "Crear negocio"}
        </Button>
      </div>
    </div>
  );
}
