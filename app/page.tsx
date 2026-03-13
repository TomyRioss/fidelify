import LandingHeader from "@/components/landing/landing-header";
import LandingHero from "@/components/landing/landing-hero";
import LandingQueEs from "@/components/landing/landing-que-es";
import LandingComoFunciona from "@/components/landing/landing-como-funciona";
import LandingBeneficios from "@/components/landing/landing-beneficios";
import LandingDiferencia from "@/components/landing/landing-diferencia";
import LandingPricing from "@/components/landing/landing-pricing";
import LandingCTA from "@/components/landing/landing-cta";
import LandingFooter from "@/components/landing/landing-footer";

export default function Home() {
  return (
    <main className="bg-white">
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
