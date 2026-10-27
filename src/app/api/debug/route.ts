import { NextResponse } from "next/server";

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

    const accessToken = tokenData.access_token;

    // Test search with fetch directly
    const searchRes = await fetch(
      "https://api.mercadolibre.com/sites/MLA/search?category=MLA1000&limit=5",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();

    return NextResponse.json({
      step: searchRes.ok ? "search_ok" : "search_failed",
      searchStatus: searchRes.status,
      searchResponse: searchRes.ok
        ? { total: searchData.paging?.total, itemCount: searchData.results?.length }
        : searchData,
    });
  } catch (err: unknown) {
    return NextResponse.json({ step: "fetch_error", error: String(err) });
  }
}
