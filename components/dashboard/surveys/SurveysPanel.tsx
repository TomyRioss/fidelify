"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiClipboard, FiPlus, FiLink, FiList } from "react-icons/fi";
import { Button } from "@/components/ui/button";

type Survey = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  externalUrl: string | null;
  active: boolean;
  createdAt: string;
  _count: { surveyQuestions: number; surveyResponses: number };
};

type Props = {
  initialData: Survey[];
  role: string;
};

export default function SurveysPanel({ initialData, role }: Props) {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>(initialData);

  const canCreate = role === "ADMIN" || role === "OWNER";

  return (
    <div className="px-6 pb-6">
      <div className="flex items-center justify-between mb-4">
        {canCreate && (
          <Button
            onClick={() => router.push("/dashboard/encuestas/new")}
            className="ml-auto bg-neutral-900 text-white hover:bg-neutral-800 flex items-center gap-2"
          >
            <FiPlus size={16} />
            Nueva encuesta
          </Button>
        )}
      </div>

      {surveys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-3">
          <FiClipboard size={40} />
          <p className="text-sm">No hay encuestas registradas.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded border border-neutral-200">
          <table className="w-full text-sm text-neutral-800">
            <thead className="bg-neutral-100 text-neutral-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Título</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-left font-medium">Preguntas</th>
                <th className="px-4 py-3 text-left font-medium">Respuestas</th>
                <th className="px-4 py-3 text-left font-medium">Activa</th>
                <th className="px-4 py-3 text-left font-medium">Creada</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((s) => (
                <tr key={s.id} className="border-t border-neutral-200 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {s.type === "EXTERNAL" ? (
                        <FiLink size={14} className="text-neutral-400 shrink-0" />
                      ) : (
                        <FiList size={14} className="text-neutral-400 shrink-0" />
                      )}
                      <span className="font-medium">{s.title}</span>
                    </div>
                    {s.description && (
                      <p className="text-xs text-neutral-400 mt-0.5 pl-5">{s.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-600">
                      {s.type === "EXTERNAL" ? "Externa" : "Interna"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {s.type === "INTERNAL" ? s._count.surveyQuestions : "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{s._count.surveyResponses}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                        s.active
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      {s.active ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(s.createdAt).toLocaleDateString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
