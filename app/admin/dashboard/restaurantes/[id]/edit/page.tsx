import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RestaurantForm from "@/components/admin/forms/RestaurantForm";

export default async function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (me?.role !== "SUPER_ADMIN") redirect("/admin");

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, slug: true, phone: true, address: true, subscriptionStatus: true },
  });
  if (!restaurant) redirect("/admin/dashboard");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Editar negocio</h1>
      <RestaurantForm
        restaurantId={restaurant.id}
        defaultValues={{
          name: restaurant.name,
          email: restaurant.email,
          slug: restaurant.slug,
          phone: restaurant.phone ?? "",
          address: restaurant.address ?? "",
          subscriptionStatus: restaurant.subscriptionStatus,
        }}
      />
    </div>
  );
}
