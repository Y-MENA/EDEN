import { NextRequest, NextResponse } from "next/server";
import { buildMarketSample } from "@/lib/mercadolibre";
import { analyzeMarket } from "@/lib/scorer";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "El parámetro 'q' es requerido." }, { status: 400 });
  }

  try {
    const sample = await buildMarketSample(query);
    const result = analyzeMarket(query, sample);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[EDEN] Error:", message);

    if (message.includes("ML_CLIENT_ID") || message.includes("ML_CLIENT_SECRET")) {
      return NextResponse.json({ error: message }, { status: 503 });
    }
    if (message.includes("categoría") || message.includes("productos")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Error al consultar la API de MercadoLibre. Intentá de nuevo." },
      { status: 502 }
    );
  }
}
