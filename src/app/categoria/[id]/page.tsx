"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { MLCategoryStats } from "@/types";

export default function CategoriaPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<MLCategoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/categories/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("No se pudo conectar con el servidor"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16 gap-8">
      <div className="w-full max-w-3xl">
        <Link href="/" className="text-gray-500 hover:text-green-400 text-sm transition-colors">
          ← Volver al inicio
        </Link>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-3xl font-bold text-white">
          E<span className="text-green-500">DEN</span>
        </h1>
        {data && (
          <p className="text-gray-400 text-sm">
            Subcategorías de <span className="text-white font-medium">{data.name}</span>
          </p>
        )}
      </div>

      {loading && (
        <p className="text-gray-400 animate-pulse text-sm">Cargando subcategorías...</p>
      )}

      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl px-6 py-4 text-red-300 text-sm max-w-xl w-full">
          {error}
        </div>
      )}

      {data && (
        <div className="w-full max-w-3xl">
          {data.children_categories.length === 0 ? (
            <div className="text-center space-y-4">
              <p className="text-gray-400 text-sm">Esta categoría no tiene subcategorías.</p>
              <Link
                href={`/ranking/${id}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Analizar esta categoría
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.children_categories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/ranking/${sub.id}`}
                  className="bg-gray-900 border border-gray-800 hover:border-green-500 rounded-2xl px-5 py-4 flex items-center justify-between transition-colors group"
                >
                  <span className="text-white text-sm font-medium group-hover:text-green-400 transition-colors">
                    {sub.name}
                  </span>
                  <span className="text-gray-600 group-hover:text-green-500 transition-colors text-lg">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
