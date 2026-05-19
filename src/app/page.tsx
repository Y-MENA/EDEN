"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MLCategory } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  MLA1000: "💻",
  MLA1051: "🏠",
  MLA1055: "🛋️",
  MLA1648: "🌱",
  MLA1182: "👗",
  MLA1430: "📱",
  MLA1500: "🔧",
  MLA1743: "🍳",
  MLA3025: "🎮",
  MLA1071: "🚗",
  MLA1144: "⚽",
  MLA1276: "📚",
  MLA1367: "🐾",
  MLA1459: "👶",
  MLA1540: "💄",
};

export default function Home() {
  const [categories, setCategories] = useState<MLCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
        else setError(data.error ?? "Error al cargar categorías");
      })
      .catch(() => setError("No se pudo conectar con el servidor"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16 gap-10">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          E<span className="text-green-500">DEN</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Explorá oportunidades de negocio en MercadoLibre Argentina
        </p>
      </div>

      {loading && (
        <p className="text-gray-400 animate-pulse text-sm">Cargando categorías...</p>
      )}

      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl px-6 py-4 text-red-300 text-sm max-w-xl w-full">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-3xl">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categoria/${cat.id}`}
              className="bg-gray-900 border border-gray-800 hover:border-green-500 rounded-2xl p-5 flex flex-col items-center gap-3 transition-colors group"
            >
              <span className="text-3xl">{CATEGORY_ICONS[cat.id] ?? "📦"}</span>
              <span className="text-white text-sm font-medium text-center group-hover:text-green-400 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
