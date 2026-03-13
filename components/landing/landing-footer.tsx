import Link from "next/link";
import Image from "next/image";

export default function LandingFooter() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <Link href="/" className="inline-block mb-2">
              <Image
                src="/logotipo.png"
                alt="fielgo"
                width={210}
                height={66}
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-neutral-500 text-sm">La nueva forma de fidelizar clientes.</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-neutral-600">
            <a href="#" className="hover:text-orange-500 transition-colors">Contacto</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Términos</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Blog</a>
          </div>
        </div>
        <div className="border-t border-neutral-100 pt-6">
          <p className="text-neutral-400 text-sm text-center">
            &copy; 2026 FielGo. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
