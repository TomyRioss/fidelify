import { FiX, FiCheck } from "react-icons/fi";

const traditional = [
  "Apps cargadas y complicadas",
  "Baja adopción por parte de clientes",
  "Procesos de registro largos",
  "Datos difíciles de interpretar",
  "Requiere mucho trabajo manual",
];

const fielgo = [
  "Experiencia rápida sin apps",
  "Alta adopción desde el día 1",
  "Registro en segundos con QR",
  "Insights claros y accionables",
  "100% automático y sin esfuerzo",
];

export default function LandingDiferencia() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-4">
            La Diferencia
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900">
            ¿Por qué FielGo es diferente?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Traditional */}
          <div className="border border-neutral-200 rounded-xl p-8 bg-neutral-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 border border-neutral-300 rounded-full flex items-center justify-center">
                <FiX size={16} className="text-neutral-400" />
              </div>
              <h3 className="font-semibold text-neutral-600 text-lg">Sistemas tradicionales</h3>
            </div>
            <ul className="space-y-4">
              {traditional.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-500">
                  <FiX size={16} className="text-neutral-400 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* FielGo */}
          <div className="border-2 border-orange-500 rounded-xl p-8 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <FiCheck size={16} className="text-white" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-lg">Con FielGo</h3>
            </div>
            <ul className="space-y-4">
              {fielgo.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-700">
                  <FiCheck size={16} className="text-orange-500 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
