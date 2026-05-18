"use client";

import { useState } from "react";

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
}

export function SearchForm({ onSearch, loading }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-xl">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Ej: "auriculares bluetooth", "silla gamer"...'
        disabled={loading}
        className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white
          placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors
          disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed
          text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        {loading ? "Analizando..." : "Analizar"}
      </button>
    </form>
  );
}
