import { NextResponse } from "next/server";
import { getTopCategories } from "@/lib/mercadolibre";

export async function GET() {
  try {
    const categories = await getTopCategories();
    return NextResponse.json(categories);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
