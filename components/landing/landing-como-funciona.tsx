import { FiUserPlus, FiClipboard, FiTrendingUp } from "react-icons/fi";

const steps = [
  {
    label: "Paso 01",
    icon: FiUserPlus,
    title: "El cliente entra y obtiene un beneficio",
    description:
      "Un cliente nuevo escanea el código QR y recibe un beneficio de bienvenida inmediato por WhatsApp. También puede ver sus puntos y premios desde la web.",
  },
  {
    label: "Paso 02",
    icon: FiClipboard,
    title: "Responde una encuesta después de consumir",
    description:
      "Después de consumir, el cliente responde una encuesta obligatoria. Esta información se procesa con IA para generar devoluciones útiles para tu local.",
  },
  {
    label: "Paso 03",
    icon: FiTrendingUp,
    title: "Recibís insights y el cliente suma puntos",
    description:
      "Tu negocio recibe feedback procesado por IA con puntos clave para mejorar. El cliente acumula puntos FielGo para futuros beneficios.",
  },
];

export default function LandingComoFunciona() {
  return (
    <section id="como-funciona" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-4">
            Proceso Simple
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900">
            ¿Cómo funciona FielGo?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative bg-white border border-neutral-200 rounded-xl p-8">
              <span className="absolute -top-3 left-6 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {step.label}
              </span>
              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mb-6 mt-2">
                <step.icon size={22} className="text-neutral-700" />
              </div>
              <h3 className="font-bold text-neutral-900 text-lg mb-3">{step.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
