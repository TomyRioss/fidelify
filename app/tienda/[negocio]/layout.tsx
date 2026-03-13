import { redirect } from "next/navigation";
import { getRestaurantBySlug } from "@/lib/services/tienda-service";

export default async function TiendaLayout({ children, params }: { children: React.ReactNode; params: Promise<{ negocio: string }> }) {
  const { negocio } = await params;
  const restaurant = await getRestaurantBySlug(negocio);

  if (!restaurant) {
    redirect("/404");
  }

  return children;
}
