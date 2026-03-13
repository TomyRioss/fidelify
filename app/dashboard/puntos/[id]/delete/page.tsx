import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteConfirm from "@/components/dashboard/forms/DeleteConfirm";

export default async function DeleteProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  const product = await prisma.catalogProduct.findFirst({
    where: { id, restaurantId: me.restaurantId },
    select: { id: true, name: true },
  });
  if (!product) redirect("/dashboard/puntos");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Eliminar producto</h1>
      <DeleteConfirm
        label="producto"
        description={`¿Eliminar el producto "${product.name}"?`}
        deleteUrl={`/api/dashboard/catalog/${id}`}
        backUrl="/dashboard/puntos"
      />
    </div>
  );
}
