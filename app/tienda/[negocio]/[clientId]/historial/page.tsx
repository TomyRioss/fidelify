import { redirect } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { getRestaurantBySlug, getClientByIdAndRestaurant } from "@/lib/services/tienda-service";
import HistorialCanjes from "@/components/tienda/HistorialCanjes";

export default async function HistorialPage({
  params,
}: {
  params: Promise<{ negocio: string; clientId: string }>;
}) {
  const { negocio, clientId } = await params;
  const restaurant = await getRestaurantBySlug(negocio);
  if (!restaurant) redirect("/404");

  const client = await getClientByIdAndRestaurant(restaurant.id, clientId);
  if (!client) redirect("/404");

  return (
    <div className="w-full min-h-screen bg-white px-6 pt-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/tienda/${negocio}/${clientId}`}
          className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-orange-600 transition-colors"
        >
          <FiArrowLeft size={18} />
          Volver
        </Link>
        <h1 className="text-xl font-semibold text-neutral-900">Historial de canjes</h1>
      </div>
      <HistorialCanjes clientId={clientId} />
    </div>
  );
}
