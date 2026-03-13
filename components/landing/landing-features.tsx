import { FiUsers, FiGift, FiBarChart, FiStar, FiSmartphone, FiTrendingUp } from "react-icons/fi";

export default function LandingFeatures() {
  const features = [
    {
      icon: FiUsers,
      title: "Gestión de Clientes",
      description: "Centraliza la información de tus clientes, crea perfiles detallados y mantén un historial completo de visitas."
    },
    {
      icon: FiGift,
      title: "Sistema de Puntos",
      description: "Premia a tus clientes leales con un sistema de puntos flexible y personalizable según tus necesidades."
    },
    {
      icon: FiBarChart,
      title: "Análisis y Reportes",
      description: "Visualiza métricas clave de tu programa de fidelización y toma decisiones informadas para crecer."
    },
    {
      icon: FiStar,
      title: "Recompensas Personalizadas",
      description: "Crea ofertas especiales y recompensas exclusivas para tus clientes más leales."
    },
    {
      icon: FiSmartphone,
      title: "App Móvil",
      description: "Tus clientes pueden ver sus puntos y canjear recompensas desde su smartphone."
    },
    {
      icon: FiTrendingUp,
      title: "Crecimiento Medible",
      description: "Mide el impacto de tu programa de fidelización con métricas claras y reportes detallados."
    }
  ];

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Todo lo que necesitas
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Potencia tu restaurante con herramientas de fidelización diseñadas para el éxito
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl hover:border-amber-200 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center mb-5">
                <feature.icon size={28} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
