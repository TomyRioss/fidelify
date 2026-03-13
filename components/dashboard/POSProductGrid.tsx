"use client";

import { useState, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import { Input } from "@/components/ui/input";

export interface POSProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
}

interface Props {
  products: POSProduct[];
  onAdd: (product: POSProduct) => void;
}

export default function POSProductGrid({ products, onAdd }: Props) {
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const cats = products
      .map((p) => p.category)
      .filter((c): c is string => Boolean(c));
    return Array.from(new Set(cats)).sort();
  }, [products]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCat && p.active !== false;
    });
  }, [products, search, selectedCategory]);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          className="pl-8 border-neutral-300 focus-visible:border-orange-400 text-neutral-900 placeholder:text-neutral-400 text-sm"
        />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !selectedCategory
                ? "bg-orange-600 text-white"
                : "bg-orange-50 text-neutral-600 hover:bg-orange-100"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-orange-600 text-white"
                  : "bg-orange-50 text-neutral-600 hover:bg-orange-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">Sin resultados.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => onAdd(product)}
                className="rounded-lg border border-orange-200 bg-white p-3 text-left transition-colors hover:border-orange-400 hover:bg-orange-50 active:scale-95"
              >
                <p className="text-sm font-medium text-neutral-900 line-clamp-2">{product.name}</p>
                {product.category && (
                  <p className="mt-0.5 text-xs text-neutral-400">{product.category}</p>
                )}
                <p className="mt-1.5 text-sm font-semibold text-orange-600">
                  ${Number(product.price).toLocaleString("es-AR")}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
