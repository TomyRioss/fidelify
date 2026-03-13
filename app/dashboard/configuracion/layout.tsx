"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { FiBriefcase, FiMapPin } from "react-icons/fi";

const NAV_ITEMS = [
  { label: "Negocio", href: "/dashboard/configuracion/negocio", icon: FiBriefcase },
  { label: "Sucursales", href: "/dashboard/configuracion/sucursales", icon: FiMapPin },
];

export default function ConfiguracionLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full">
      <aside className="w-48 shrink-0 border-r border-neutral-200 bg-white flex flex-col py-6 gap-1 px-3">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-orange-50 font-medium text-orange-600"
                  : "text-neutral-500 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <Icon className="shrink-0 text-base" />
              {label}
            </Link>
          );
        })}
      </aside>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
