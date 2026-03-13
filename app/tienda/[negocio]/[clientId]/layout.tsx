import { redirect } from "next/navigation";
import { getRestaurantBySlug, getClientByIdAndRestaurant } from "@/lib/services/tienda-service";

export default async function ClienteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ negocio: string; clientId: string }> }) {
  const { negocio, clientId } = await params;
  const restaurant = await getRestaurantBySlug(negocio);
  if (!restaurant) redirect("/404");

  const client = await getClientByIdAndRestaurant(restaurant.id, clientId);
  if (!client) redirect("/404");

  return <>{children}</>;
}
