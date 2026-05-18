import type { ProductMatch } from "@/types";

export function ProductGrid({ matches }: { matches: ProductMatch[] }) {
  if (!matches.length) return null;

  return (
    <div className="w-full">
      <p className="text-gray-400 text-xs mb-3 uppercase tracking-wider">
        Productos analizados
      </p>
      <div className="grid grid-cols-3 gap-3">
        {matches.map((p) => (
          <div
            key={p.id}
            className="bg-gray-800 rounded-xl overflow-hidden flex flex-col"
          >
            <div className="aspect-square bg-white flex items-center justify-center overflow-hidden">
              {p.thumbnailUrl ? (
                <img
                  src={p.thumbnailUrl}
                  alt={p.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-700" />
              )}
            </div>
            <div className="p-2 flex flex-col gap-1 flex-1">
              <p className="text-white text-xs leading-tight line-clamp-2">
                {p.name}
              </p>
              <span className="mt-auto text-green-400 text-xs font-medium">
                {Math.round(p.relevance * 100)}% match
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
