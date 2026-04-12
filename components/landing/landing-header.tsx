import Link from "next/link";
import Image from "next/image";

export default function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logotipo.png"
            alt="fielgo"
            width={240}
            height={72}
            className="h-20 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <a
            href="#que-es"
            className="text-gray-600 hover:text-orange-500 transition-colors text-base font-normal"
          >
            Qué es
          </a>
          <a
            href="#como-funciona"
            className="text-gray-600 hover:text-orange-500 transition-colors text-base font-normal"
          >
            Cómo funciona
          </a>
          <a
            href="#beneficios"
            className="text-gray-600 hover:text-orange-500 transition-colors text-base font-normal"
          >
            Beneficios
          </a>
          <a
            href="#pricing"
            className="text-gray-600 hover:text-orange-500 transition-colors text-base font-normal"
          >
            Precios
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/clientes/login"
            className="hidden sm:flex items-center gap-1.5 border border-orange-400 text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Soy cliente
          </Link>
          <Link
            href="/login"
            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
          >
            Probar gratis
          </Link>
        </div>
      </div>
    </header>
  );
}
