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

    // Test 1: search WITH token
    const s1 = await fetch("https://api.mercadolibre.com/sites/MLA/search?category=MLA1000&limit=3", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const d1 = await s1.json();

    // Test 2: search WITHOUT token (public)
    const s2 = await fetch("https://api.mercadolibre.com/sites/MLA/search?category=MLA1000&limit=3");
    const d2 = await s2.json();

    // Test 3: highlights WITH token
    const s3 = await fetch("https://api.mercadolibre.com/highlights/MLA/category/MLA1000?limit=5", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const d3 = await s3.json();

    return NextResponse.json({
      search_with_token: { status: s1.status, ok: s1.ok, data: s1.ok ? { total: d1.paging?.total } : d1 },
      search_no_token:   { status: s2.status, ok: s2.ok, data: s2.ok ? { total: d2.paging?.total } : d2 },
      highlights_token:  { status: s3.status, ok: s3.ok, data: s3.ok ? { count: d3.content?.length } : d3 },
    });
  } catch (err: unknown) {
    return NextResponse.json({ step: "fetch_error", error: String(err) });
  }
}
