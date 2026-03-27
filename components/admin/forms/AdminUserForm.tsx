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

type Props = {
  restaurantId: string;
  userId?: string;
  defaultValues?: {
    name?: string;
    email?: string;
    role?: string;
  };
};

export default function AdminUserForm({ restaurantId, userId, defaultValues }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: defaultValues?.name ?? "",
    email: defaultValues?.email ?? "",
    password: "",
    role: (defaultValues?.role as "ADMIN" | "EMPLOYEE" | "OWNER") ?? "ADMIN",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.name || !form.email) {
      toast.error("Nombre y email son requeridos.");
      return;
    }
    if (!userId && !form.password) {
      toast.error("La contraseña es requerida.");
      return;
    }
    setLoading(true);
    try {
      if (userId) {
        const body: Record<string, unknown> = { name: form.name, email: form.email, role: form.role };
        if (form.password) body.password = form.password;
        const res = await fetch(`/api/admin/restaurants/${restaurantId}/users/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al actualizar el usuario.");
        }
      } else {
        const res = await fetch(`/api/admin/restaurants/${restaurantId}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al crear el usuario.");
        }
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[AdminUserForm] handleSubmit error:", err);
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
          placeholder="Juan Pérez"
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
          placeholder="usuario@negocio.com"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password" className="text-neutral-700 font-medium">
          {userId ? "Contraseña (dejar vacío para no cambiar)" : "Contraseña *"}
        </Label>
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="••••••••"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role" className="text-neutral-700 font-medium">Rol *</Label>
        <Select
          value={form.role}
          onValueChange={(v) => setForm((f) => ({ ...f, role: v as "ADMIN" | "EMPLOYEE" | "OWNER" }))}
        >
          <SelectTrigger id="role" className="bg-white border-neutral-300 text-neutral-900 focus:border-orange-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
            <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
            <SelectItem value="OWNER">OWNER</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
          {loading ? "Guardando..." : userId ? "Guardar cambios" : "Crear usuario"}
        </Button>
      </div>
    </div>
  );
}
