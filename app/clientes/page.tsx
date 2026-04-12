import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ClienteDashboard from "@/components/cliente/ClienteDashboard";

export default async function ClientesPage() {
  const session = await auth();

  if (!session?.user) redirect("/clientes/login");
  if ((session.user as { type?: string }).type !== "cliente") redirect("/login");

  return <ClienteDashboard clienteName={session.user.name ?? ""} />;
}
