import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function LandingCTA() {
  return (
    <section className="py-24 px-6 bg-orange-500">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4 leading-tight">
          Empezá a fidelizar<br />clientes hoy mismo
        </h2>
        <p className="text-neutral-800 text-lg mb-10 max-w-xl mx-auto">
          Unite a los restaurantes que ya usan FielGo para aumentar sus visitas repetidas y mejorar su negocio.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href="/register"
            className="bg-white hover:bg-neutral-100 text-neutral-900 px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Probar Gratis por 30 días <FiArrowRight size={18} />
          </Link>
          <a
            href="https://wa.me/5491134083140"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-neutral-900 text-neutral-900 hover:bg-orange-600 px-8 py-4 rounded-lg font-semibold transition-all duration-200 w-full sm:w-auto justify-center flex items-center"
          >
            Agendar una Demo
          </a>
        </div>
        <p className="text-neutral-700 text-sm">Sin tarjeta de crédito. Sin compromiso.</p>
      </div>
    </section>
  );
}
