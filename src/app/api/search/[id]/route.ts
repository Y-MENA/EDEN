export const runtime = "edge";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("X-ML-Token");

  if (!token) {
    return Response.json({ error: "Missing token" }, { status: 400 });
  }

  const res = await fetch(
    `https://api.mercadolibre.com/sites/MLA/search?category=${id}&limit=50`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json();

  if (!res.ok) {
    return Response.json(
      { error: data.message || `ML error ${res.status}`, mlStatus: res.status },
      { status: res.status }
    );
  }

  return Response.json(data);
}
