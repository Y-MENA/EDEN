import { NextResponse } from "next/server";
import { buildMarketSampleById } from "@/lib/mercadolibre";

export async function GET() {
  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;

  // Test OAuth token
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId ?? "",
    client_secret: clientSecret ?? "",
  });

  try {
    const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return NextResponse.json({
        step: "oauth",
        status: tokenRes.status,
        mlResponse: tokenData,
        envCheck: { hasClientId: !!clientId, clientIdLength: clientId?.length, hasSecret: !!clientSecret, secretLength: clientSecret?.length },
      });
    }

    // Test search API with a known category (Computación = MLA1000)
    try {
      const sample = await buildMarketSampleById("MLA1000");
      return NextResponse.json({ step: "search_ok", itemCount: sample.items.length, totalListings: sample.totalCategoryItems, categoryName: sample.categoryName });
    } catch (searchErr: unknown) {
      return NextResponse.json({ step: "search_failed", error: searchErr instanceof Error ? searchErr.message : String(searchErr) });
    }
  } catch (err: unknown) {
    return NextResponse.json({ step: "fetch_error", error: String(err) });
  }
}
