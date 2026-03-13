import Link from "next/link";
import { FiArrowRight, FiMessageCircle, FiPlay } from "react-icons/fi";

export default function LandingHero() {
  return (
    <>
      {/* WhatsApp Badge */}
      <a
        href="https://wa.me/5491134083140"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group"
      >
        <FiMessageCircle size={28} />
        <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chatear por WhatsApp
        </span>
      </a>

      <section className="min-h-screen w-full flex items-center justify-center px-6 bg-white pt-20">
        <div className="text-center w-full max-w-3xl mx-auto py-24">
          {/* Pill badge */}
          <div className="inline-block border border-neutral-300 rounded-full px-4 py-1.5 text-sm text-neutral-700 mb-8">
            FielGo — Fidelización por WhatsApp y Web para gastronomía
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-neutral-900 mb-6 leading-tight tracking-tight">
            La nueva forma de<br />fidelizar clientes<br />en gastronomía.
          </h1>

          <p className="text-lg text-neutral-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Impulsá visitas repetidas, obtené reseñas reales y mejorá tu negocio con un sistema simple y automático.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              href="/register"
              className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Probar Gratis <FiArrowRight size={18} />
            </Link>
            <a
              href="https://wa.me/5491134083140"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-neutral-800 text-neutral-800 hover:bg-neutral-50 px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <FiPlay size={14} /> Agendar una Demo
            </a>
          </div>

          {/* Bottom badge */}
          <div className="inline-flex items-center gap-2 bg-neutral-100 rounded-full px-5 py-2.5 text-sm text-neutral-600">
            <FiMessageCircle size={16} className="text-orange-500" />
            WhatsApp + Web — Sin apps que instalar
          </div>
        </div>
      </section>
    </>
  );
}
