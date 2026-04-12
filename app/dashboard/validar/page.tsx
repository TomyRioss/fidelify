import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ValidarCodigo from "@/components/dashboard/ValidarCodigo";

export default async function ValidarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { restaurantId: true },
  });

  if (!me?.restaurantId) redirect("/dashboard");

  return (
    <div className="flex flex-col gap-6">
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Validar código de canje</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Ingresá el código de 8 caracteres que aparece en el comprobante del cliente para verificar el canje.
        </p>
      </div>
      <ValidarCodigo />
    </div>
  );
}
