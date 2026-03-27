"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FiClipboard, FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
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
  externalUrl?: string | null;
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
      .then((data) => setSurveys(Array.isArray(data) ? data.filter((s: Survey) => s.active) : []))
      .catch((e) => {
        toast.error("Error al cargar encuestas.");
        console.error("[EncuestasTab] fetch error:", e);
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  async function handleExternalClick(survey: Survey) {
    if (survey.externalUrl) window.open(survey.externalUrl, "_blank");
    try {
      const res = await fetch(`/api/dashboard/encuestas/${survey.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, answers: [] }),
      });
      const data = await res.json();
      if (res.ok) {
        const pts = data.pointsAwarded ?? 0;
        if (pts > 0) onPointsChange(currentPoints + pts);
        setSurveys((prev) =>
          prev.map((s) => (s.id === survey.id ? { ...s, alreadyResponded: true } : s))
        );
      } else {
        toast.error(data.error ?? "Error al registrar respuesta.");
        console.error("[EncuestasTab] external respond error:", data);
      }
    } catch (e) {
      toast.error("Error de red al registrar encuesta externa.");
      console.error("[EncuestasTab] external network error:", e);
    }
  }

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
      <div className="rounded-xl border border-orange-200 bg-white p-8 text-center">
        <FiClipboard className="mx-auto mb-2 text-2xl text-neutral-400" />
        <p className="text-sm text-neutral-500">No hay encuestas activas.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {surveys.map((survey) => (
        <div key={survey.id} className="rounded-xl border border-orange-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-neutral-900">{survey.title}</p>
              {survey.description && (
                <p className="mt-1 text-sm text-neutral-500">{survey.description}</p>
              )}
            </div>
            {survey.alreadyResponded ? (
              <span className="shrink-0 rounded-full bg-neutral-100 px-4 py-2 text-sm text-neutral-500">
                Ya respondida
              </span>
            ) : survey.type === "EXTERNAL" ? (
              <button
                onClick={() => handleExternalClick(survey)}
                className="shrink-0 rounded-lg border border-orange-400 bg-orange-50 px-5 py-2.5 text-sm font-medium text-orange-700 hover:bg-orange-100"
              >
                Ir a encuesta
              </button>
            ) : (
              <button
                onClick={() => setActive(active === survey.id ? null : survey.id)}
                className="shrink-0 rounded-lg border border-orange-400 bg-orange-50 px-5 py-2.5 text-sm font-medium text-orange-700 hover:bg-orange-100"
              >
                {active === survey.id ? "Cerrar" : "Responder"}
              </button>
            )}
          </div>

          {active === survey.id && !survey.alreadyResponded && (
            <div className="mt-5 flex flex-col gap-6 border-t border-neutral-100 pt-5">
              {survey.surveyQuestions
                .sort((a, b) => a.order - b.order)
                .map((q) => (
                  <div key={q.id} className="flex flex-col gap-3">
                    <p className="text-lg font-bold text-neutral-900">{q.text}</p>
                    {q.type === "FREE_TEXT" && (
                      <Input
                        placeholder="Tu respuesta"
                        value={answers[q.id] ?? ""}
                        onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                        className="h-14 text-base border-2 border-neutral-300 focus-visible:border-orange-400 placeholder:text-neutral-400 text-neutral-900"
                      />
                    )}
                    {q.type === "YES_NO" && (
                      <div className="flex gap-3">
                        {["Sí", "No"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                            className={`rounded-lg border px-6 py-2.5 text-sm font-medium transition-colors ${
                              answers[q.id] === opt
                                ? "border-orange-600 bg-orange-600 text-white"
                                : "border-neutral-300 text-neutral-700 hover:bg-orange-50"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                    {q.type === "SCALE" && (
                      <div className="flex gap-1">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => {
                          const selected = Number(answers[q.id] ?? 0);
                          const filled = star <= selected;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setAnswers((a) => ({ ...a, [q.id]: String(star) }))}
                              className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                            >
                              {filled ? (
                                <FaStar className="text-orange-500" />
                              ) : (
                                <FiStar className="text-neutral-300" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {q.type === "MULTIPLE_CHOICE" && Array.isArray(q.options) && (
                      <div className="flex flex-wrap gap-2">
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                            className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors ${
                              answers[q.id] === opt
                                ? "border-orange-600 bg-orange-600 text-white"
                                : "border-neutral-300 text-neutral-700 hover:bg-orange-50"
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
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500 disabled:opacity-50"
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
