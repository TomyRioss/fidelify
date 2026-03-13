"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FiClipboard } from "react-icons/fi";
import { Input } from "@/components/ui/input";

interface SurveyQuestion {
  id: string;
  text: string;
  type: "FREE_TEXT" | "YES_NO" | "SCALE" | "MULTIPLE_CHOICE";
  options: string[] | null;
  order: number;
}

interface Survey {
  id: string;
  title: string;
  description: string | null;
  type: string;
  active: boolean;
  alreadyResponded: boolean;
  surveyQuestions: SurveyQuestion[];
}

interface Props {
  clientId: string;
  currentPoints: number;
  onPointsChange: (pts: number) => void;
}

export default function EncuestasTab({ clientId, currentPoints, onPointsChange }: Props) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/dashboard/encuestas?clientId=${clientId}`)
      .then((r) => r.json())
      .then((data) => setSurveys(Array.isArray(data) ? data.filter((s: Survey) => s.type === "INTERNAL" && s.active) : []))
      .catch((e) => {
        toast.error("Error al cargar encuestas.");
        console.error("[EncuestasTab] fetch error:", e);
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  async function handleSubmit(survey: Survey) {
    const answersArr = survey.surveyQuestions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] ?? "",
    }));

    setSubmitting(true);
    try {
      const res = await fetch(`/api/dashboard/encuestas/${survey.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, answers: answersArr }),
      });
      const data = await res.json();
      if (res.ok) {
        const pts = data.pointsAwarded ?? 0;
        toast.success(pts > 0 ? `Encuesta enviada. +${pts} puntos acreditados.` : "Encuesta enviada correctamente.");
        if (pts > 0) onPointsChange(currentPoints + pts);
        setSurveys((prev) =>
          prev.map((s) => (s.id === survey.id ? { ...s, alreadyResponded: true } : s))
        );
        setActive(null);
        setAnswers({});
      } else {
        toast.error(data.error ?? "Error al enviar encuesta.");
        console.error("[EncuestasTab] submit error:", data);
      }
    } catch (e) {
      toast.error("Error de red al enviar encuesta.");
      console.error("[EncuestasTab] network error:", e);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-neutral-500">Cargando encuestas...</p>;

  if (surveys.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
        <FiClipboard className="mx-auto mb-2 text-2xl text-neutral-400" />
        <p className="text-sm text-neutral-500">No hay encuestas activas.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {surveys.map((survey) => (
        <div key={survey.id} className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-900">{survey.title}</p>
              {survey.description && (
                <p className="text-xs text-neutral-500">{survey.description}</p>
              )}
            </div>
            {survey.alreadyResponded ? (
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500">
                Ya respondida
              </span>
            ) : (
              <button
                onClick={() => setActive(active === survey.id ? null : survey.id)}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                {active === survey.id ? "Cerrar" : "Responder"}
              </button>
            )}
          </div>

          {active === survey.id && !survey.alreadyResponded && (
            <div className="mt-4 flex flex-col gap-4 border-t border-neutral-100 pt-4">
              {survey.surveyQuestions
                .sort((a, b) => a.order - b.order)
                .map((q) => (
                  <div key={q.id} className="flex flex-col gap-2">
                    <p className="text-xs font-medium text-neutral-800">{q.text}</p>
                    {q.type === "FREE_TEXT" && (
                      <Input
                        placeholder="Tu respuesta"
                        value={answers[q.id] ?? ""}
                        onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      />
                    )}
                    {q.type === "YES_NO" && (
                      <div className="flex gap-2">
                        {["Sí", "No"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                            className={`rounded-lg border px-4 py-1.5 text-xs transition-colors ${
                              answers[q.id] === opt
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                    {q.type === "SCALE" && (
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        placeholder="1-10"
                        value={answers[q.id] ?? ""}
                        onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                        className="w-24"
                      />
                    )}
                    {q.type === "MULTIPLE_CHOICE" && Array.isArray(q.options) && (
                      <div className="flex flex-wrap gap-2">
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                            className={`rounded-lg border px-3 py-1 text-xs transition-colors ${
                              answers[q.id] === opt
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              <div className="flex justify-end">
                <button
                  onClick={() => handleSubmit(survey)}
                  disabled={submitting}
                  className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
                >
                  {submitting ? "Enviando..." : "Enviar respuestas"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
