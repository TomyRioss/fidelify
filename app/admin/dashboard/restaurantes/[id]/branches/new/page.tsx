import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BranchForm from "@/components/admin/forms/BranchForm";

export default async function NewBranchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (me?.role !== "SUPER_ADMIN") redirect("/admin");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Nueva sucursal</h1>
      <BranchForm restaurantId={id} />
    </div>
  );
}
