import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId ?? "",
    client_secret: clientSecret ?? "",
  });

  try {
    const res = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const data = await res.json();
    return NextResponse.json({
      status: res.status,
      mlResponse: data,
      envCheck: {
        hasClientId: !!clientId,
        clientIdLength: clientId?.length,
        hasSecret: !!clientSecret,
        secretLength: clientSecret?.length,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ fetchError: String(err) });
  }
}
