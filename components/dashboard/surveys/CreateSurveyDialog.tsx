"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Question = {
  text: string;
  type: string;
  options: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (survey: unknown) => void;
};

const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Opción múltiple" },
  { value: "SCALE", label: "Escala" },
  { value: "FREE_TEXT", label: "Texto libre" },
  { value: "YES_NO", label: "Sí / No" },
];

export default function CreateSurveyDialog({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("INTERNAL");
  const [externalUrl, setExternalUrl] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { text: "", type: "FREE_TEXT", options: "" },
  ]);
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setTitle("");
    setDescription("");
    setType("INTERNAL");
    setExternalUrl("");
    setQuestions([{ text: "", type: "FREE_TEXT", options: "" }]);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, { text: "", type: "FREE_TEXT", options: "" }]);
  }

  function removeQuestion(idx: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateQuestion(idx: number, field: keyof Question, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("El título es requerido.");
      return;
    }
    if (type === "EXTERNAL" && !externalUrl.trim()) {
      toast.error("La URL externa es requerida.");
      return;
    }
    if (type === "INTERNAL") {
      const invalid = questions.some((q) => !q.text.trim());
      if (invalid) {
        toast.error("Todas las preguntas deben tener texto.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/encuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          externalUrl: type === "EXTERNAL" ? externalUrl.trim() : undefined,
          questions: type === "INTERNAL" ? questions : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("[CreateSurveyDialog] Error creating survey:", data.error);
        toast.error(data.error || "Error al crear la encuesta.");
        return;
      }

      toast.success("Encuesta creada correctamente.");
      onCreated(data);
      handleClose();
    } catch (err) {
      console.error("[CreateSurveyDialog] Unexpected error:", err);
      toast.error("Error inesperado al crear la encuesta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-neutral-900">Nueva encuesta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre de la encuesta"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción breve"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
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
              <Label htmlFor="externalUrl">URL externa</Label>
              <Input
                id="externalUrl"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://forms.google.com/..."
              />
            </div>
          )}

          {type === "INTERNAL" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label>Preguntas</Label>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <FiPlus size={14} />
                  Agregar pregunta
                </button>
              </div>

              {questions.map((q, idx) => (
                <div key={idx} className="flex flex-col gap-2 rounded border border-neutral-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-neutral-500">Pregunta {idx + 1}</span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(idx)}
                        className="text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>

                  <Input
                    value={q.text}
                    onChange={(e) => updateQuestion(idx, "text", e.target.value)}
                    placeholder="Texto de la pregunta"
                  />

                  <Select
                    value={q.type}
                    onValueChange={(v) => updateQuestion(idx, "type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map((qt) => (
                        <SelectItem key={qt.value} value={qt.value}>
                          {qt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {q.type === "MULTIPLE_CHOICE" && (
                    <Input
                      value={q.options}
                      onChange={(e) => updateQuestion(idx, "options", e.target.value)}
                      placeholder="Opciones separadas por coma (ej: Bueno, Regular, Malo)"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-neutral-300 text-neutral-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-neutral-900 text-white hover:bg-neutral-800"
            >
              {loading ? "Creando..." : "Crear encuesta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
