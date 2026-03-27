"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiPlus, FiTrash2 } from "react-icons/fi";
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

type QuestionType = "MULTIPLE_CHOICE" | "SCALE" | "FREE_TEXT" | "YES_NO";

type Question = {
  text: string;
  type: QuestionType;
  options: string;
};

export default function SurveyForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"INTERNAL" | "EXTERNAL">("INTERNAL");
  const [externalUrl, setExternalUrl] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [rewardPoints, setRewardPoints] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  function addQuestion() {
    setQuestions((prev) => [...prev, { text: "", type: "FREE_TEXT", options: "" }]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, field: keyof Question, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("El título es requerido.");
      return;
    }
    if (type === "EXTERNAL" && !externalUrl.trim()) {
      toast.error("La URL externa es requerida.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        type,
        externalUrl: type === "EXTERNAL" ? externalUrl.trim() : null,
        rewardPoints: rewardPoints > 0 ? rewardPoints : 0,
        questions: type === "INTERNAL"
          ? questions.map((q) => ({
              text: q.text,
              type: q.type,
              options: q.type === "MULTIPLE_CHOICE"
                ? q.options.split(",").map((o) => o.trim()).filter(Boolean)
                : [],
            }))
          : [],
      };
      const res = await fetch("/api/dashboard/encuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al crear la encuesta.");
      }
      router.push("/dashboard/encuestas");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado.";
      console.error("[SurveyForm] handleSubmit error:", err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-orange-200 bg-white p-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title" className="text-neutral-700 font-medium">Título *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Encuesta de satisfacción"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description" className="text-neutral-700 font-medium">Descripción</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opcional"
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rewardPoints" className="text-neutral-700 font-medium">Puntos por completar</Label>
        <Input
          id="rewardPoints"
          type="number"
          min={0}
          value={rewardPoints}
          onChange={(e) => setRewardPoints(Math.max(0, parseInt(e.target.value) || 0))}
          className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="surveyType" className="text-neutral-700 font-medium">Tipo</Label>
        <Select value={type} onValueChange={(v) => setType(v as "INTERNAL" | "EXTERNAL")}>
          <SelectTrigger id="surveyType" className="bg-white border-neutral-300 text-neutral-900 focus:border-orange-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INTERNAL">Interna</SelectItem>
            <SelectItem value="EXTERNAL">Externa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {type === "EXTERNAL" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="externalUrl" className="text-neutral-700 font-medium">URL externa *</Label>
          <Input
            id="externalUrl"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://forms.google.com/..."
            className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
          />
        </div>
      )}
      {type === "INTERNAL" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-700">Preguntas</p>
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 border border-orange-300 px-2 py-1 hover:bg-orange-50 transition-colors"
            >
              <FiPlus className="text-xs" />
              Agregar pregunta
            </button>
          </div>
          {questions.map((q, i) => (
            <div key={i} className="border border-orange-200 p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label htmlFor={`q-text-${i}`} className="text-neutral-700 font-medium">Pregunta {i + 1}</Label>
                  <Input
                    id={`q-text-${i}`}
                    value={q.text}
                    onChange={(e) => updateQuestion(i, "text", e.target.value)}
                    placeholder="Texto de la pregunta"
                    className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="mt-6 p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                >
                  <FiTrash2 className="text-base" />
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`q-type-${i}`} className="text-neutral-700 font-medium">Tipo de respuesta</Label>
                <Select
                  value={q.type}
                  onValueChange={(v) => v && updateQuestion(i, "type", v)}
                >
                  <SelectTrigger id={`q-type-${i}`} className="bg-white border-neutral-300 text-neutral-900 focus:border-orange-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE_TEXT">Texto libre</SelectItem>
                    <SelectItem value="MULTIPLE_CHOICE">Opción múltiple</SelectItem>
                    <SelectItem value="SCALE">Escala</SelectItem>
                    <SelectItem value="YES_NO">Sí / No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {q.type === "MULTIPLE_CHOICE" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`q-options-${i}`} className="text-neutral-700 font-medium">Opciones (separadas por coma)</Label>
                  <Input
                    id={`q-options-${i}`}
                    value={q.options}
                    onChange={(e) => updateQuestion(i, "options", e.target.value)}
                    placeholder="Opción A, Opción B, Opción C"
                    className="bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
                  />
                </div>
              )}
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-sm text-neutral-400">No hay preguntas agregadas.</p>
          )}
        </div>
      )}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          className="bg-white border border-orange-300 text-neutral-700 hover:bg-orange-50 hover:text-orange-600"
          onClick={() => router.push("/dashboard/encuestas")}
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
          {loading ? "Creando..." : "Crear encuesta"}
        </Button>
      </div>
    </div>
  );
}
