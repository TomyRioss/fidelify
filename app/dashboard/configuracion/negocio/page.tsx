import { Suspense } from "react";
import BusinessSettingsCard from "@/components/dashboard/BusinessSettingsCard";
import PointsRuleCard from "@/components/dashboard/PointsRuleCard";
import PointsCalculatorPreview from "@/components/dashboard/PointsCalculatorPreview";

export default function NegocioPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Configuración</h1>
        <p className="text-sm text-neutral-500">Configura los datos de tu negocio y el sistema de puntos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BusinessSettingsCard />
        <PointsRuleCard />
      </div>

      <Suspense>
        <PointsCalculatorPreview />
      </Suspense>
    </div>
  );
}
