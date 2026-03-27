import { redirect } from "next/navigation";
import { getRestaurantBySlug } from "@/lib/services/tienda-service";
import RegisterForm from "@/components/tienda/RegisterForm";

export default async function RegisterPage({ params }: { params: Promise<{ negocio: string }> }) {
  const { negocio } = await params;
  const restaurant = await getRestaurantBySlug(negocio);

  if (!restaurant) {
    redirect("/404");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50">
      <div className="w-full max-w-md rounded-lg border border-orange-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">{restaurant.name}</h1>
          <p className="mt-2 text-neutral-600">Creá tu cuenta para acumular puntos</p>
        </div>
        <RegisterForm negocio={negocio} />
      </div>
    </div>
  );
}
