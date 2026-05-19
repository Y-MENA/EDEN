"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { SubcategoryRanking } from "@/types";

const VERDICT_COLOR: Record<string, string> = {
  Excelente: "text-green-400",
  Bueno: "text-lime-400",
  Regular: "text-yellow-400",
  Saturado: "text-red-400",
};

const VERDICT_BG: Record<string, string> = {
  Excelente: "bg-green-500/10 border-green-500/30",
  Bueno: "bg-lime-500/10 border-lime-500/30",
  Regular: "bg-yellow-500/10 border-yellow-500/30",
  Saturado: "bg-red-500/10 border-red-500/30",
};

export default function RankingPage() {
  const { id } = useParams<{ id: string }>();
  const [ranking, setRanking] = useState<SubcategoryRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/rank/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setRanking(d);
      })
      .catch(() => setError("No se pudo conectar con el servidor"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16 gap-8">
      <div className="w-full max-w-2xl">
        <button onClick={() => window.history.back()} className="text-gray-500 hover:text-green-400 text-sm transition-colors">
          ← Volver
        </button>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold text-white">
          E<span className="text-green-500">DEN</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Ranking de oportunidades de venta
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-gray-400 animate-pulse text-sm">Analizando el mercado...</p>
          <p className="text-gray-600 text-xs">Esto puede tardar unos segundos</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl px-6 py-4 text-red-300 text-sm max-w-xl w-full">
          {error}
        </div>
      )}

      {!loading && !error && ranking.length > 0 && (
        <div className="w-full max-w-2xl space-y-3">
          <p className="text-gray-500 text-xs text-right">{ranking.length} productos analizados · ordenados por oportunidad</p>
          {ranking.map((item, index) => (
            <div
              key={item.categoryId}
              className={`border rounded-2xl px-5 py-4 flex items-center gap-4 ${VERDICT_BG[item.verdict]}`}
            >
              <span className="text-2xl font-bold text-gray-600 w-8 text-center">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{item.categoryName}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                  <span>{item.totalListings.toLocaleString("es-AR")} publicaciones</span>
                  <span>{item.uniqueSellers} vendedores</span>
                  <span>{item.premiumListingsRatio}% premium</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-bold text-lg ${VERDICT_COLOR[item.verdict]}`}>{item.score}</p>
                <p className={`text-xs font-medium ${VERDICT_COLOR[item.verdict]}`}>{item.verdict}</p>
              </div>
            </div>
          ))}

          <div className="mt-6 border border-gray-800 rounded-2xl p-4 text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-400">Cómo leer el ranking</p>
            <p><span className="text-green-400">Excelente (75-100)</span> — Poca competencia, mercado abierto</p>
            <p><span className="text-lime-400">Bueno (55-74)</span> — Oportunidad moderada</p>
            <p><span className="text-yellow-400">Regular (35-54)</span> — Mercado competitivo</p>
            <p><span className="text-red-400">Saturado (0-34)</span> — Alta competencia y marcas dominantes</p>
          </div>
        </div>
      )}

      {!loading && !error && ranking.length === 0 && (
        <p className="text-gray-500 text-sm">No se encontraron datos para esta categoría.</p>
      )}
    </main>
  );
}
