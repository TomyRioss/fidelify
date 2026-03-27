import { redirect } from "next/navigation";
import { getRestaurantBySlug, getClientByIdAndRestaurant } from "@/lib/services/tienda-service";
import ClientDashboard from "@/components/tienda/ClientDashboard";

export default async function ClientePage({ params }: { params: Promise<{ negocio: string; clientId: string }> }) {
  const { negocio, clientId } = await params;
  const restaurant = await getRestaurantBySlug(negocio);
  if (!restaurant) redirect("/404");

  const client = await getClientByIdAndRestaurant(restaurant.id, clientId);
  if (!client) redirect("/404");

  return <ClientDashboard client={client} negocio={negocio} />;
}
