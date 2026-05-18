"use client";

import { useState } from "react";
import { SearchForm } from "@/components/SearchForm";
import { ScoreGauge } from "@/components/ScoreGauge";
import { CriteriaBar } from "@/components/CriteriaBar";
import type { AnalysisResult } from "@/types";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(query: string) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/analyze?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error desconocido.");
        return;
      }

      setResult(data as AnalysisResult);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16 gap-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          E<span className="text-green-500">DEN</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Analizá oportunidades de negocio en MercadoLibre Argentina
        </p>
      </div>

      <SearchForm onSearch={handleSearch} loading={loading} />

      {/* Loading */}
      {loading && (
        <div className="text-gray-400 animate-pulse text-sm">
          Consultando MercadoLibre...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl px-6 py-4 text-red-300 text-sm max-w-xl w-full">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="w-full max-w-xl space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center gap-6">
            <p className="text-gray-400 text-sm">
              Resultado para:{" "}
              <span className="text-white font-medium">"{result.query}"</span>
            </p>

            <ScoreGauge score={result.score} verdict={result.verdict} />

            <div className="w-full border-t border-gray-800 pt-4 space-y-4">
              <CriteriaBar
                label="Cantidad de vendedores"
                score={result.criteria.sellers}
                detail={result.details.sellers}
              />
              <CriteriaBar
                label="Saturación de categoría"
                score={result.criteria.saturation}
                detail={result.details.saturation}
              />
              <CriteriaBar
                label="Calidad de publicaciones"
                score={result.criteria.quality}
                detail={result.details.quality}
              />
              <CriteriaBar
                label="Presencia de marcas fuertes"
                score={result.criteria.brands}
                detail={result.details.brands}
              />
            </div>

            {/* Stats row */}
            <div className="w-full grid grid-cols-3 gap-3 border-t border-gray-800 pt-4">
              <Stat label="Publicaciones" value={result.totalListings.toLocaleString("es-AR")} />
              <Stat label="Vendedores únicos" value={result.uniqueSellers.toString()} />
              <Stat label="Listings premium" value={`${result.premiumListingsRatio}%`} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-3 text-center">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
    </div>
  );
}
