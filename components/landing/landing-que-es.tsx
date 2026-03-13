import { FiMessageCircle, FiGlobe, FiMonitor, FiGift } from "react-icons/fi";

const features = [
  {
    icon: FiMessageCircle,
    title: "WhatsApp para tus clientes",
    description:
      "Tus clientes interactúan por WhatsApp: reciben beneficios, responden encuestas y acumulan puntos sin instalar ninguna app.",
  },
  {
    icon: FiGlobe,
    title: "Web para ver catálogo y puntos",
    description:
      "Los clientes también acceden a una web donde ven su catálogo de premios, puntos acumulados y beneficios disponibles.",
  },
  {
    icon: FiMonitor,
    title: "Panel de administración para dueños",
    description:
      "Los dueños de locales cuentan con un panel web completo para gestionar premios, ver métricas y administrar su negocio.",
  },
  {
    icon: FiGift,
    title: "Sin apps que instalar",
    description:
      "Ni tus clientes ni vos necesitan descargar ninguna aplicación. Todo funciona desde WhatsApp y la web.",
  },
];

export default function LandingQueEs() {
  return (
    <section id="que-es" className="py-24 px-6 bg-neutral-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-neutral-500 uppercase mb-4">
              ¿Qué es FielGo?
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 leading-tight">
              Fidelización inteligente para tu restaurante
            </h2>
            <p className="text-neutral-600 leading-relaxed mb-4">
              FielGo combina WhatsApp y web para ofrecer la mejor experiencia de fidelización. Tus clientes interactúan por WhatsApp y consultan sus puntos y premios en la web — sin instalar ninguna app.
            </p>
            <p className="text-neutral-600 leading-relaxed">
              Los dueños de locales acceden a un panel de administración completo con métricas, gestión de premios e insights potenciados por IA.
            </p>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-5 flex items-start gap-4 border border-neutral-100">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <f.icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
