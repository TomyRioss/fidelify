"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiLogOut,
  FiStar,
  FiChevronDown,
  FiShoppingBag,
  FiTag,
  FiGift,
  FiClipboard,
  FiAward,
  FiPlusCircle,
  FiSettings,
  FiUsers,
  FiUser,
  FiBriefcase,
  FiDollarSign,
  FiMapPin,
} from "react-icons/fi";
import { signOut, useSession } from "next-auth/react";
import { useBranch } from "@/lib/branch-context";

const ADMIN_ITEMS = [
  { label: "Clientes", href: "/dashboard/clientes", icon: FiUser },
  { label: "Empleados", href: "/dashboard/empleados", icon: FiUsers },
];

const LOYALTY_ITEMS = [
  { label: "Tienda de puntos", href: "/dashboard/puntos", icon: FiShoppingBag },
  { label: "Cupones", href: "/dashboard/cupones", icon: FiTag },
  { label: "Regalos", href: "/dashboard/regalos", icon: FiGift },
  { label: "Encuestas", href: "/dashboard/encuestas", icon: FiClipboard },
  { label: "Sorteos", href: "/dashboard/sorteos", icon: FiAward },
  { label: "Añadir puntos manualmente", href: "/dashboard/puntos/manual", icon: FiPlusCircle },
  { label: "Registrar venta", href: "/dashboard/puntos/registrar-venta", icon: FiDollarSign },
];

export default function BusinessSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const canManageBranches = userRole === "OWNER" || userRole === "ADMIN";
  const { restaurantName, activeBranch, branches, setActiveBranch } = useBranch();
  const [branchOpen, setBranchOpen] = useState(false);
  const branchRef = useRef<HTMLDivElement>(null);
  const [adminOpen, setAdminOpen] = useState(
    ADMIN_ITEMS.some((i) => pathname.startsWith(i.href))
  );
  const [loyaltyOpen, setLoyaltyOpen] = useState(
    LOYALTY_ITEMS.some((i) => pathname.startsWith(i.href))
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (branchRef.current && !branchRef.current.contains(e.target as Node)) {
        setBranchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const homeActive = pathname === "/dashboard";
  const settingsActive = pathname.startsWith("/dashboard/configuracion");

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-neutral-200 bg-white">
      <div className="flex flex-col justify-center border-b border-neutral-100 px-5 py-4">
        {restaurantName ? (
          <span className="text-xl font-bold text-neutral-900 leading-tight truncate">{restaurantName}</span>
        ) : (
          <div className="h-6 w-24 animate-pulse rounded bg-neutral-200" />
        )}
        {branches.length > 0 && (
          <div className="relative mt-1" ref={branchRef}>
            <button
              onClick={() => setBranchOpen((o) => !o)}
              className="flex w-full items-center gap-1.5 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-700 hover:bg-orange-100 transition-colors"
            >
              <FiMapPin className="shrink-0 text-xs" />
              <span className="flex-1 text-left truncate">{activeBranch?.name ?? "Seleccionar sucursal"}</span>
              <FiChevronDown className={`shrink-0 text-xs transition-transform duration-150 ${branchOpen ? "rotate-180" : ""}`} />
            </button>
            {branchOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-orange-200 bg-white shadow-md">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => { setActiveBranch(b); setBranchOpen(false); }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-orange-50 ${
                      activeBranch?.id === b.id ? "font-semibold text-orange-600" : "text-neutral-700"
                    }`}
                  >
                    <FiMapPin className="shrink-0" />
                    {b.name}
                  </button>
                ))}
                {canManageBranches && (
                  <Link
                    href="/dashboard/configuracion/sucursales/new"
                    onClick={() => setBranchOpen(false)}
                    className="flex w-full items-center gap-2 border-t border-orange-100 px-3 py-2 text-xs text-orange-600 transition-colors hover:bg-orange-50"
                  >
                    <FiPlusCircle className="shrink-0" />
                    Añadir sucursal
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-6">
        {/* Inicio */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
            homeActive
              ? "bg-orange-50 font-medium text-orange-600"
              : "text-neutral-500 hover:bg-orange-50 hover:text-orange-600"
          }`}
        >
          <FiHome className="shrink-0 text-lg" />
          Inicio
        </Link>

        {/* Administración – dropdown */}
        <div>
          <button
            onClick={() => setAdminOpen((o) => !o)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
              adminOpen || ADMIN_ITEMS.some((i) => pathname.startsWith(i.href))
                ? "bg-neutral-100 font-medium text-neutral-900"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
          >
            <FiBriefcase className="shrink-0 text-lg" />
            <span className="flex-1 text-left">Administración</span>
            <FiChevronDown
              className={`shrink-0 text-base transition-transform duration-200 ${adminOpen ? "rotate-180" : ""}`}
            />
          </button>

          {adminOpen && (
            <div className="mt-1 flex flex-col gap-0.5 pl-4">
              {ADMIN_ITEMS.map(({ label, href, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-neutral-100 font-medium text-neutral-900"
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                    }`}
                  >
                    <Icon className="shrink-0 text-base" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Configurar fidelización – dropdown */}
        <div>
          <button
            onClick={() => setLoyaltyOpen((o) => !o)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
              loyaltyOpen || LOYALTY_ITEMS.some((i) => pathname.startsWith(i.href))
                ? "bg-neutral-100 font-medium text-neutral-900"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
            }`}
          >
            <FiStar className="shrink-0 text-lg" />
            <span className="flex-1 text-left">Configurar fidelización</span>
            <FiChevronDown
              className={`shrink-0 text-base transition-transform duration-200 ${loyaltyOpen ? "rotate-180" : ""}`}
            />
          </button>

          {loyaltyOpen && (
            <div className="mt-1 flex flex-col gap-0.5 pl-4">
              {LOYALTY_ITEMS.map(({ label, href, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-neutral-100 font-medium text-neutral-900"
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                    }`}
                  >
                    <Icon className="shrink-0 text-base" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Configuración general */}
        <Link
          href="/dashboard/configuracion"
          className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
            settingsActive
              ? "bg-orange-50 font-medium text-orange-600"
              : "text-neutral-500 hover:bg-orange-50 hover:text-orange-600"
          }`}
        >
          <FiSettings className="shrink-0 text-lg" />
          Configuración general
        </Link>
      </nav>

      <div className="border-t border-neutral-100 px-3 py-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-orange-50 hover:text-orange-600"
        >
          <FiLogOut className="shrink-0 text-lg" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
