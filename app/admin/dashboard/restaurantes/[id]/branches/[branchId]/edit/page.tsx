import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BranchForm from "@/components/admin/forms/BranchForm";

export default async function EditBranchPage({ params }: { params: Promise<{ id: string; branchId: string }> }) {
  const { id, branchId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (me?.role !== "SUPER_ADMIN") redirect("/admin");

  const branch = await prisma.branch.findFirst({
    where: { id: branchId, restaurantId: id },
    select: { id: true, name: true, address: true, phone: true },
  });
  if (!branch) redirect("/admin/dashboard");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Editar sucursal</h1>
      <BranchForm
        restaurantId={id}
        branchId={branch.id}
        defaultValues={{
          name: branch.name,
          address: branch.address ?? "",
          phone: branch.phone ?? "",
        }}
      />
    </div>
  );
}
