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
  raffleId?: string;
  defaultValues?: {
    name?: string;
    description?: string;
    prizeFirst?: string;
    prizeSecond?: string;
    prizeThird?: string;
    closingDate?: string;
    participationType?: string;
    pointsCost?: string;
  };
};

export default function RaffleForm({ raffleId, defaultValues }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: defaultValues?.name ?? "",
    description: defaultValues?.description ?? "",
    prizeFirst: defaultValues?.prizeFirst ?? "",
    prizeSecond: defaultValues?.prizeSecond ?? "",
    prizeThird: defaultValues?.prizeThird ?? "",
    closingDate: defaultValues?.closingDate ?? "",
    participationType: (defaultValues?.participationType as "FREE" | "POINTS_COST") ?? "FREE",
    pointsCost: defaultValues?.pointsCost ?? "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.name.trim() || !form.prizeFirst.trim() || !form.closingDate) {
      toast.error("Nombre, primer premio y fecha de cierre son requeridos.");
      return;
    }
    if (form.participationType === "POINTS_COST" && (!form.pointsCost || Number(form.pointsCost) <= 0)) {
      toast.error("Ingresá el costo en puntos.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        prizeFirst: form.prizeFirst.trim(),
        prizeSecond: form.prizeSecond.trim() || null,
        prizeThird: form.prizeThird.trim() || null,
        closingDate: form.closingDate,
        participationType: form.participationType,
        pointsCost: form.participationType === "POINTS_COST" ? Number(form.pointsCost) : null,
      };
      if (raffleId) {
        const res = await fetch(`/api/dashboard/sorteos/${raffleId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al actualizar el sorteo.");
        }
      } else {
        const res = await fetch("/api/dashboard/sorteos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Error al crear el sorteo.");
        }
      }
      router.push("/dashboard/sorteos");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[RaffleForm] handleSubmit error:", err);
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
          placeholder="Sorteo de Navidad"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Opcional"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prizeFirst">1° Premio *</Label>
        <Input
          id="prizeFirst"
          value={form.prizeFirst}
          onChange={(e) => setForm((f) => ({ ...f, prizeFirst: e.target.value }))}
          placeholder="Cena para 2 personas"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prizeSecond">2° Premio</Label>
        <Input
          id="prizeSecond"
          value={form.prizeSecond}
          onChange={(e) => setForm((f) => ({ ...f, prizeSecond: e.target.value }))}
          placeholder="Opcional"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prizeThird">3° Premio</Label>
        <Input
          id="prizeThird"
          value={form.prizeThird}
          onChange={(e) => setForm((f) => ({ ...f, prizeThird: e.target.value }))}
          placeholder="Opcional"
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="closingDate">Fecha cierre *</Label>
        <Input
          id="closingDate"
          type="datetime-local"
          value={form.closingDate}
          onChange={(e) => setForm((f) => ({ ...f, closingDate: e.target.value }))}
          className="text-neutral-900"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="participationType">Participación *</Label>
        <Select
          value={form.participationType}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, participationType: v as "FREE" | "POINTS_COST", pointsCost: "" }))
          }
        >
          <SelectTrigger id="participationType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FREE">Gratis</SelectItem>
            <SelectItem value="POINTS_COST">Con costo en puntos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {form.participationType === "POINTS_COST" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pointsCost">Costo en puntos *</Label>
          <Input
            id="pointsCost"
            type="number"
            min={1}
            value={form.pointsCost}
            onChange={(e) => setForm((f) => ({ ...f, pointsCost: e.target.value }))}
            placeholder="100"
            className="text-neutral-900"
          />
        </div>
      )}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="outline"
          className="border-neutral-300 text-neutral-700"
          onClick={() => router.push("/dashboard/sorteos")}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          className="bg-neutral-900 text-white hover:bg-neutral-700"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Guardando..." : raffleId ? "Guardar cambios" : "Crear sorteo"}
        </Button>
      </div>
    </div>
  );
}
