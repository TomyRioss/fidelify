import { FiCheck } from "react-icons/fi";
import Link from "next/link";

const features = [
  "Clientes ilimitados",
  "Consumos ilimitados",
  "Premios activos ilimitados",
  "Dashboard completo",
  "Sistema integrado de IA",
  "Notificaciones personalizadas",
  "Cuentas de caja múltiples",
];

export default function LandingPricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-4">
            Precios
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-3">
            Un único plan, sin complicaciones
          </h2>
          <p className="text-neutral-500">Sin costos ocultos. Cancelá cuando quieras.</p>
        </div>

        <div className="relative border-2 border-orange-500 rounded-2xl p-10 bg-white max-w-lg mx-auto">
          {/* Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-orange-500 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
              Plan completo
            </span>
          </div>

          <h3 className="text-xl font-bold text-neutral-900 mb-1 mt-2">Plan FielGo</h3>
          <p className="text-neutral-500 text-sm mb-6">Todo lo que necesitás para fidelizar</p>

          <div className="flex items-baseline gap-1 mb-8">
            <span className="text-5xl font-black text-neutral-900">$40.000</span>
            <span className="text-neutral-500">/mes</span>
          </div>

          <ul className="space-y-3 mb-8">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-neutral-700 text-sm">
                <FiCheck size={16} className="text-orange-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/register"
            className="block w-full text-center bg-orange-600 hover:bg-orange-500 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-200"
          >
            Comenzar ahora
          </Link>
        </div>
      </div>
    </section>
  );
}
