import axios from "axios";
import type {
  MLCategoryStats,
  MLDomainDiscoveryResult,
  MLHighlightsResponse,
  MLProductItemsResponse,
  MarketSample,
} from "@/types";

const ML_API = "https://api.mercadolibre.com";
const SITE_ID = "MLA";

// Token cache — ML tokens last ~6 hours
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Faltan ML_CLIENT_ID y ML_CLIENT_SECRET. Completá el archivo .env.local con las credenciales de tu app en developers.mercadolibre.com.ar"
    );
  }

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const { data } = await axios.post(`${ML_API}/oauth/token`, params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };

  return cachedToken.value;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

async function discoverCategory(query: string, token: string): Promise<MLDomainDiscoveryResult> {
  const { data } = await axios.get<MLDomainDiscoveryResult[]>(
    `${ML_API}/sites/${SITE_ID}/domain_discovery/search`,
    { params: { q: query, limit: 1 }, headers: authHeaders(token) }
  );
  if (!data.length) throw new Error(`No se encontró categoría para "${query}"`);
  return data[0];
}

async function getCategoryStats(categoryId: string, token: string): Promise<MLCategoryStats> {
  const { data } = await axios.get<MLCategoryStats>(`${ML_API}/categories/${categoryId}`, {
    headers: authHeaders(token),
  });
  return data;
}

async function getHighlightProductIds(categoryId: string, token: string, limit = 20): Promise<string[]> {
  const { data } = await axios.get<MLHighlightsResponse>(
    `${ML_API}/highlights/${SITE_ID}/category/${categoryId}`,
    { params: { limit }, headers: authHeaders(token) }
  );
  return data.content
    .filter((c) => c.type === "PRODUCT")
    .map((c) => c.id);
}

async function getProductItems(productId: string, token: string, limit = 50): Promise<MLProductItemsResponse> {
  const { data } = await axios.get<MLProductItemsResponse>(
    `${ML_API}/products/${productId}/items`,
    { params: { limit }, headers: authHeaders(token) }
  );
  return data;
}

export async function buildMarketSample(query: string): Promise<MarketSample> {
  const token = await getAccessToken();

  const category = await discoverCategory(query, token);
  const [stats, productIds] = await Promise.all([
    getCategoryStats(category.category_id, token),
    getHighlightProductIds(category.category_id, token, 20),
  ]);

  if (!productIds.length) {
    throw new Error(`No se encontraron productos destacados para "${query}"`);
  }

  // Fetch items for first 10 products in parallel
  const batch = productIds.slice(0, 10);
  const itemResponses = await Promise.all(
    batch.map((id) =>
      getProductItems(id, token, 50).catch(() => null)
    )
  );

  const items = itemResponses
    .filter(Boolean)
    .flatMap((r) => r!.results);

  return {
    categoryId: category.category_id,
    categoryName: category.category_name,
    totalCategoryItems: stats.total_items_in_this_category,
    items,
  };
}
