import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminUserForm from "@/components/admin/forms/AdminUserForm";

export default async function EditAdminUserPage({ params }: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (me?.role !== "SUPER_ADMIN") redirect("/admin");

  const user = await prisma.user.findFirst({
    where: { id: userId, restaurantId: id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) redirect("/admin/dashboard");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">Editar usuario</h1>
      <AdminUserForm
        restaurantId={id}
        userId={user.id}
        defaultValues={{ name: user.name, email: user.email, role: user.role }}
      />
    </div>
  );
}
