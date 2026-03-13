"use client";

import { useState } from "react";
import { FiUsers, FiZap, FiBarChart2, FiStar, FiUserPlus } from "react-icons/fi";

const tabs = [
  {
    label: "Crecé con datos reales",
    cards: [
      {
        icon: FiUserPlus,
        title: "Fidelización real de clientes",
        description:
          "Creá un sistema de recompensas que motive a tus clientes a volver a consumir en tu local una y otra vez.",
      },
      {
        icon: FiZap,
        title: "Imagen tecnológica e innovadora",
        description:
          "Posicioná tu negocio como moderno y a la vanguardia. Destacate de la competencia con una experiencia única.",
      },
      {
        icon: FiBarChart2,
        title: "Dashboards con métricas clave",
        description:
          "Accedé a un sistema de dashboards que te dan métricas clave para mejorar día a día con feedback constante de tus clientes.",
      },
    ],
  },
  {
    label: "Aumentá tu visibilidad en Google",
    cards: [
      {
        icon: FiStar,
        title: "Más reseñas en Google",
        description:
          "FielGo incentiva a tus clientes a dejar reseñas reales en Google después de cada visita, mejorando tu puntuación y visibilidad.",
      },
      {
        icon: FiUsers,
        title: "Mayor alcance orgánico",
        description:
          "Con más reseñas positivas, tu local aparece más arriba en las búsquedas de Google Maps y Google Search.",
      },
      {
        icon: FiBarChart2,
        title: "Reputación online sólida",
        description:
          "Construí una reputación digital fuerte y confiable que atraiga nuevos clientes de forma constante.",
      },
    ],
  },
];

export default function LandingBeneficios() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="beneficios" className="py-24 px-6 bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-4">
            Beneficios para tu local
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-8">
            Hacé crecer tu negocio con datos reales
          </h2>

          {/* Tabs */}
          <div className="inline-flex border border-neutral-200 rounded-full bg-white p-1 gap-1">
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === i
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tabs[activeTab].cards.map((card, i) => (
            <div key={i} className="bg-white rounded-xl p-8 border border-neutral-100">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mb-5">
                <card.icon size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-neutral-900 text-lg mb-3">{card.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
