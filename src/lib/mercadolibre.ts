import axios from "axios";
import type {
  MLCategoryStats,
  MLDomainDiscoveryResult,
  MLHighlightsResponse,
  MLProductItemsResponse,
  MarketSample,
  ProductMatch,
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

interface MLProductDetails {
  id: string;
  name: string;
  pictures: { id: string; url?: string; secure_url?: string }[];
  attributes: { id: string; name: string; value_name: string | null }[];
  short_description?: { type: string; content: string };
}

async function getProductDetails(productId: string, token: string): Promise<MLProductDetails | null> {
  try {
    const { data } = await axios.get<MLProductDetails>(
      `${ML_API}/products/${productId}`,
      { headers: authHeaders(token) }
    );
    return data;
  } catch {
    return null;
  }
}

const STOP_WORDS = new Set([
  "de", "la", "el", "los", "las", "un", "una", "con", "para", "en",
  "a", "al", "del", "y", "o", "e", "u", "que", "por", "se", "su",
  "sus", "es", "son", "como", "mas", "sin", "si", "no",
]);

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function computeRelevance(query: string, details: MLProductDetails): number {
  const terms = stripAccents(query.toLowerCase())
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));

  if (terms.length === 0) return 1;

  const textParts: string[] = [details.name];
  for (const attr of details.attributes) {
    if (attr.value_name) textParts.push(`${attr.name} ${attr.value_name}`);
  }
  if (details.short_description?.content) {
    textParts.push(details.short_description.content.replace(/<[^>]+>/g, " "));
  }
  const corpus = stripAccents(textParts.join(" ").toLowerCase());
  const corpusWords = corpus.split(/\s+/);

  const matched = terms.filter((term) =>
    corpusWords.some(
      (word) =>
        word === term ||
        word.startsWith(term) ||
        (term.startsWith(word) && word.length >= 4)
    )
  );

  return matched.length / terms.length;
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

  // Fetch details for all highlighted products to score relevance
  const detailsResults = await Promise.all(
    productIds.map((id) => getProductDetails(id, token))
  );

  const scored = detailsResults
    .map((details, i) => ({
      id: productIds[i],
      details,
      relevance: details ? computeRelevance(query, details) : 0,
    }))
    .sort((a, b) => b.relevance - a.relevance);

  // Keep products above threshold; fall back to top 5 if none qualify
  const THRESHOLD = 0.4;
  const qualified = scored.filter((p) => p.relevance >= THRESHOLD);
  const relevant = qualified.length >= 3 ? qualified : scored.slice(0, 5);

  const topMatches: ProductMatch[] = relevant
    .slice(0, 3)
    .filter((p) => p.details !== null)
    .map((p) => ({
      id: p.id,
      name: p.details!.name,
      thumbnailUrl:
        p.details!.pictures[0]?.url ?? p.details!.pictures[0]?.secure_url ?? "",
      relevance: parseFloat(p.relevance.toFixed(2)),
    }));

  // Fetch items only for relevant products (up to 10)
  const relevantIds = relevant.slice(0, 10).map((p) => p.id);
  const itemResponses = await Promise.all(
    relevantIds.map((id) => getProductItems(id, token, 50).catch(() => null))
  );

  const items = itemResponses
    .filter(Boolean)
    .flatMap((r) => r!.results);

  return {
    categoryId: category.category_id,
    categoryName: category.category_name,
    totalCategoryItems: stats.total_items_in_this_category,
    items,
    topMatches,
  };
}
