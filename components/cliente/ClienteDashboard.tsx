"use client";

import { useEffect, useRef, useState } from "react";
import { FiSearch, FiUser, FiLogOut } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import LocalAdheridoCard from "./LocalAdheridoCard";
import LocalRecomendadoCard from "./LocalRecomendadoCard";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
}

interface ClienteLocal {
  id: string;
  restaurantId: string;
  restaurant: Restaurant;
}

interface Props {
  clienteName: string;
}

export default function ClienteDashboard({ clienteName }: Props) {
  const [adheridos, setAdheridos] = useState<ClienteLocal[]>([]);
  const [masLocales, setMasLocales] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [afilRes, restRes] = await Promise.all([
          fetch("/api/cliente/afiliaciones"),
          fetch("/api/cliente/restaurants"),
        ]);

        if (!afilRes.ok) throw new Error("Error cargando locales adheridos.");
        if (!restRes.ok) throw new Error("Error cargando locales disponibles.");

        const [afilData, restData]: [ClienteLocal[], Restaurant[]] = await Promise.all([
          afilRes.json(),
          restRes.json(),
        ]);

        setAdheridos(afilData);
        setMasLocales(restData);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error cargando datos.";
        console.error("[ClienteDashboard] load error:", err);
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAfiliar(restaurantId: string) {
    const res = await fetch("/api/cliente/afiliaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error al adherirse.");
    }

    const newClient: ClienteLocal = await res.json();

    setAdheridos((prev) => [...prev, newClient]);
    setMasLocales((prev) => prev.filter((r) => r.id !== restaurantId));
  }

  const searchLower = search.toLowerCase().trim();

  const filteredAdheridos = searchLower
    ? adheridos.filter((a) => a.restaurant.name.toLowerCase().includes(searchLower))
    : adheridos;

  const filteredMasLocales = searchLower
    ? masLocales.filter((r) => r.name.toLowerCase().includes(searchLower))
    : masLocales;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-sm text-red-500 border border-red-200 bg-red-50 rounded-lg px-4 py-3">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <div className="flex items-start justify-between mb-5">
        <h1 className="text-3xl font-bold text-neutral-900 leading-tight">
          Bienvenido {clienteName}
        </h1>

        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-14 h-14 rounded-full border-2 border-orange-200 bg-orange-50 flex items-center justify-center hover:bg-orange-100 transition-colors"
          >
            <FiUser className="text-orange-500 text-2xl" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-orange-200 rounded-xl shadow-lg py-3 z-50">
              <div className="px-4 pb-3 border-b border-orange-100">
                <p className="text-sm font-semibold text-neutral-900">{clienteName}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/clientes/login" })}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <FiLogOut className="text-base" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative mb-8">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Busca un local..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus-visible:border-orange-400"
        />
      </div>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-neutral-700 mb-3">
          Tus locales adheridos
        </h2>
        {filteredAdheridos.length === 0 ? (
          <p className="text-sm text-neutral-400">
            {searchLower ? "Sin resultados." : "Todavía no estás adherido a ningún local."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredAdheridos.map((a) => (
              <LocalAdheridoCard
                key={a.id}
                name={a.restaurant.name}
                address={a.restaurant.address}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-neutral-700 mb-3">
          Más locales en Fielgo
        </h2>
        {filteredMasLocales.length === 0 ? (
          <p className="text-sm text-neutral-400">
            {searchLower ? "Sin resultados." : "No hay más locales disponibles."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredMasLocales.map((r) => (
              <LocalRecomendadoCard
                key={r.id}
                id={r.id}
                name={r.name}
                address={r.address}
                onAfiliar={handleAfiliar}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
