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
    <div className="border border-orange-200 bg-white p-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-neutral-700 font-medium">Nombre *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Mi Negocio"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-neutral-700 font-medium">Email *</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="negocio@email.com"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug" className="text-neutral-700 font-medium">Slug *</Label>
        <Input
          id="slug"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          placeholder="mi-negocio"
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
        <Label htmlFor="address" className="text-neutral-700 font-medium">Dirección</Label>
        <Input
          id="address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          placeholder="Av. Corrientes 1234"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subscriptionStatus" className="text-neutral-700 font-medium">Estado suscripción</Label>
        <Select
          value={form.subscriptionStatus}
          onValueChange={(v) => setForm((f) => ({ ...f, subscriptionStatus: v as SubscriptionStatus }))}
        >
          <SelectTrigger id="subscriptionStatus" className="bg-white border-neutral-300 text-neutral-900 focus:border-orange-400">
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
          <div className="border-t border-orange-100 pt-2">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Owner del negocio</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="adminName" className="text-neutral-700 font-medium">Nombre *</Label>
            <Input
              id="adminName"
              value={form.adminName}
              onChange={(e) => setForm((f) => ({ ...f, adminName: e.target.value }))}
              placeholder="Juan Pérez"
              className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="adminEmail" className="text-neutral-700 font-medium">Email *</Label>
            <Input
              id="adminEmail"
              type="email"
              value={form.adminEmail}
              onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))}
              placeholder="admin@negocio.com"
              className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="adminPassword" className="text-neutral-700 font-medium">Contraseña *</Label>
            <Input
              id="adminPassword"
              type="password"
              value={form.adminPassword}
              onChange={(e) => setForm((f) => ({ ...f, adminPassword: e.target.value }))}
              placeholder="••••••••"
              className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
            />
          </div>
        </>
      )}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          className="bg-white border border-orange-300 text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
          onClick={() => router.push("/admin/dashboard")}
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
          {loading ? "Guardando..." : restaurantId ? "Guardar cambios" : "Crear negocio"}
        </Button>
      </div>
    </div>
  );
}
