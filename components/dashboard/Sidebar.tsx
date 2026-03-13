"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBriefcase, FiLogOut } from "react-icons/fi";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { label: "Negocios", href: "/admin/dashboard", icon: FiBriefcase },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-neutral-200 bg-white">
      <div className="flex h-16 items-center border-b border-neutral-100 px-5">
        <span className="text-base font-semibold tracking-tight text-neutral-900">Fidely</span>
      </div>

      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-6">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
                active
                  ? "bg-neutral-100 font-medium text-neutral-900"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <Icon className="shrink-0 text-lg" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-100 px-3 py-3">
        <button
          onClick={() => signOut({ callbackUrl: "/admin" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
        >
          <FiLogOut className="shrink-0 text-lg" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
