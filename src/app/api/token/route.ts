import { NextResponse } from "next/server";

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function GET() {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return NextResponse.json({ token: cachedToken.value });
  }

  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Faltan credenciales ML" }, { status: 500 });
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: `OAuth error: ${data.message}` }, { status: 500 });
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };

  return NextResponse.json({ token: cachedToken.value });
}
