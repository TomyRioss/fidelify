import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import {
  FiUsers,
  FiShoppingBag,
  FiGift,
  FiTag,
  FiAward,
  FiClipboard,
  FiMonitor,
  FiShield,
} from "react-icons/fi";
import StatsCards from "@/components/dashboard/StatsCards";

const MODULES = [
  { label: "Clientes", description: "Gestioná tu base de clientes y su actividad.", icon: FiUsers, href: "/dashboard/clientes" },
  { label: "Tienda de puntos", description: "Configurá cómo los clientes acumulan puntos.", icon: FiShoppingBag, href: "/dashboard/puntos" },
  { label: "Regalos", description: "Definí recompensas canjeables por puntos.", icon: FiGift, href: "/dashboard/regalos" },
  { label: "Cupones", description: "Creá y distribuí cupones de descuento.", icon: FiTag, href: "/dashboard/cupones" },
  { label: "Sorteos", description: "Organizá sorteos entre tus clientes.", icon: FiAward, href: "/dashboard/sorteos" },
  { label: "Encuestas", description: "Recopilá opiniones y feedback.", icon: FiClipboard, href: "/dashboard/encuestas" },
];

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const name = session.user.name ?? "usuario";

  const statsRes = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/dashboard/stats`, {
    cache: "no-store",
  });
  const stats = await statsRes.json();

  const restaurantSlug = (session.user as { restaurantSlug?: string }).restaurantSlug;
  const role = (session.user as { role?: string }).role;
  console.log("[DashboardPage] role:", role, "| restaurantSlug:", restaurantSlug);

  return (
    <div className="w-full flex flex-col gap-8 px-6 pt-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Bienvenido, {name}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Desde acá podés gestionar todos los módulos de tu programa de fidelidad.
        </p>
      </div>

      {stats && typeof stats === "object" && "totalEarned" in stats && (
        <StatsCards stats={stats} />
      )}

      <div className="flex gap-3">
        {restaurantSlug && (
          <Link
            href={`/tienda/${restaurantSlug}/login`}
            className="flex items-center gap-2 w-fit rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
          >
            <FiMonitor className="text-base" />
            Acceder al Sistema
          </Link>
        )}
        {role === "SUPER_ADMIN" && (
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 w-fit rounded-lg border border-orange-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
          >
            <FiShield className="text-base text-orange-500" />
            Admin
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map(({ label, description, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col gap-3 rounded-xl border border-orange-200 bg-white p-6 transition-colors hover:bg-orange-50 hover:border-orange-300"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
              <Icon className="text-xl text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">{label}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
