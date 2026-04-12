import LandingHeader from "@/components/landing/landing-header";
import LandingHero from "@/components/landing/landing-hero";
import LandingQueEs from "@/components/landing/landing-que-es";
import LandingComoFunciona from "@/components/landing/landing-como-funciona";
import LandingBeneficios from "@/components/landing/landing-beneficios";
import LandingDiferencia from "@/components/landing/landing-diferencia";
import LandingPricing from "@/components/landing/landing-pricing";
import LandingCTA from "@/components/landing/landing-cta";
import LandingFooter from "@/components/landing/landing-footer";

const jsonLdSoftware = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Fielgo",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://fielgo.com",
  description:
    "Fielgo es el sistema de fidelización para gastronomía. Permite a restaurantes, bares y cafeterías gestionar puntos, premios y cupones digitales para fidelizar clientes de forma simple y efectiva.",
  inLanguage: "es",
  offers: {
    "@type": "Offer",
    priceCurrency: "ARS",
    availability: "https://schema.org/InStock",
  },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Fielgo",
  url: "https://fielgo.com",
  logo: "https://fielgo.com/logotipo.png",
  description:
    "Fielgo es una plataforma de fidelización de clientes diseñada para negocios gastronómicos en Argentina. Ayuda a restaurantes, bares y cafeterías a retener clientes mediante programas de puntos, recompensas y cupones digitales.",
  foundingDate: "2024",
  addressCountry: "AR",
  inLanguage: "es",
};

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Qué es Fielgo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Fielgo es un sistema de fidelización para gastronomía. Permite a restaurantes, bares y cafeterías crear programas de puntos y recompensas para retener clientes. Los negocios gestionan todo desde un panel web y los clientes acumulan puntos por cada compra.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo funciona el sistema de puntos de Fielgo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cada vez que un cliente realiza una compra, el negocio le asigna puntos desde el panel de Fielgo. El cliente acumula puntos y los canjea por premios, descuentos o cupones que el negocio configura. Todo el proceso es digital, sin tarjetas físicas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Para qué tipo de negocios gastronómicos sirve Fielgo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Fielgo está diseñado para cualquier negocio gastronómico: restaurantes, bares, cafeterías, heladerías, pizzerías, hamburgueserías y similares. Es ideal para negocios que quieren fidelizar clientes frecuentes y aumentar la recurrencia de visitas.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo fidelizo clientes con Fielgo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Con Fielgo podés crear un programa de puntos personalizado: configurás cuántos puntos se dan por compra, qué premios o descuentos se pueden canjear, y emitís cupones digitales. Tus clientes se registran con su teléfono y empiezan a acumular beneficios de inmediato.",
      },
    },
    {
      "@type": "Question",
      name: "¿Qué es un sistema de fidelización para gastronomía?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Un sistema de fidelización para gastronomía es una herramienta que permite a los negocios del rubro recompensar a sus clientes frecuentes con puntos, descuentos o premios. Reemplaza las tarjetas de sellos físicas con una solución digital que se gestiona desde el celular o computadora.",
      },
    },
    {
      "@type": "Question",
      name: "¿Fielgo funciona para bares y cafeterías?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sí. Fielgo está pensado para todo tipo de negocio gastronómico, incluyendo bares, cafeterías, cervecerías y locales de comida rápida. El sistema es flexible y permite configurar las reglas de puntos y premios según el tipo de negocio.",
      },
    },
    {
      "@type": "Question",
      name: "¿Los clientes necesitan una app para usar Fielgo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Los clientes acceden a su cuenta de fidelización desde el navegador web de su celular, sin necesidad de descargar ninguna aplicación. Solo necesitan registrarse con su número de teléfono o email en la página del negocio.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cómo empiezo a usar Fielgo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Podés registrar tu negocio en fielgo.com de forma gratuita. Después de crear tu cuenta, configurás tu programa de puntos y premios desde el panel de administración. En menos de 30 minutos tu negocio ya puede empezar a fidelizar clientes.",
      },
    },
  ],
};

export default function Home() {
  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <LandingHeader />
      <LandingHero />
      <LandingQueEs />
      <LandingComoFunciona />
      <LandingBeneficios />
      <LandingDiferencia />
      <LandingPricing />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
