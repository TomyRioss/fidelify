import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CatalogProductForm from "@/components/dashboard/forms/CatalogProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { restaurantId: true, role: true } });
  if (!me?.restaurantId) redirect("/dashboard");

  const product = await prisma.catalogProduct.findFirst({
    where: { id, restaurantId: me.restaurantId },
    select: { id: true, name: true, description: true, pointCost: true, imageUrl: true, active: true },
  });
  if (!product) redirect("/dashboard/puntos");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Editar producto</h1>
      <CatalogProductForm
        productId={product.id}
        defaultValues={{
          name: product.name,
          description: product.description ?? "",
          pointCost: String(product.pointCost),
          imageUrl: product.imageUrl ?? "",
          active: product.active,
        }}
      />
    </div>
  );
}
