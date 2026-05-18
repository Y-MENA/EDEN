import type { MarketSample, AnalysisResult, ScoreCriteria } from "@/types";

const PREMIUM_TYPES = new Set(["gold_special", "gold_pro", "gold_premium"]);

// Thresholds calibrated for MercadoLibre Argentina
const T = {
  sellers:    { low: 5,    mid: 25,   high: 80   },
  saturation: { low: 300,  mid: 2000, high: 8000 },
  quality:    { low: 0.3,  mid: 0.55, high: 0.75 }, // premium listing ratio
  brands:     { low: 0.05, mid: 0.2,  high: 0.4  }, // official store ratio
};

function scoreSellers(n: number): number {
  if (n <= T.sellers.low)  return 25;
  if (n <= T.sellers.mid)  return 19;
  if (n <= T.sellers.high) return 11;
  return 4;
}

function scoreSaturation(n: number): number {
  if (n <= T.saturation.low)  return 25;
  if (n <= T.saturation.mid)  return 18;
  if (n <= T.saturation.high) return 10;
  return 3;
}

// High premium ratio = mature, competitive market = lower opportunity
function scoreQuality(ratio: number): number {
  if (ratio <= T.quality.low)  return 22;
  if (ratio <= T.quality.mid)  return 16;
  if (ratio <= T.quality.high) return 9;
  return 4;
}

function scoreBrands(ratio: number): number {
  if (ratio <= T.brands.low)  return 25;
  if (ratio <= T.brands.mid)  return 17;
  if (ratio <= T.brands.high) return 9;
  return 3;
}

function verdict(score: number): AnalysisResult["verdict"] {
  if (score >= 75) return "Excelente";
  if (score >= 55) return "Bueno";
  if (score >= 35) return "Regular";
  return "Saturado";
}

export function analyzeMarket(query: string, sample: MarketSample): AnalysisResult {
  const { items, totalCategoryItems, categoryName, topMatches } = sample;

  const uniqueSellers = new Set(items.map((i) => i.seller_id)).size;
  const officialStores = items.filter((i) => i.official_store_id != null).length;
  const premiumListings = items.filter((i) => PREMIUM_TYPES.has(i.listing_type_id)).length;
  const premiumRatio = items.length > 0 ? premiumListings / items.length : 0;
  const brandsRatio = items.length > 0 ? officialStores / items.length : 0;

  const criteria: ScoreCriteria = {
    sellers:    scoreSellers(uniqueSellers),
    saturation: scoreSaturation(totalCategoryItems),
    quality:    scoreQuality(premiumRatio),
    brands:     scoreBrands(brandsRatio),
  };

  const score = criteria.sellers + criteria.saturation + criteria.quality + criteria.brands;

  return {
    query,
    categoryName,
    totalListings: totalCategoryItems,
    uniqueSellers,
    officialStores,
    premiumListingsRatio: parseFloat((premiumRatio * 100).toFixed(1)),
    score,
    criteria,
    verdict: verdict(score),
    details: {
      sellers:    `${uniqueSellers} vendedores únicos en la muestra analizada`,
      saturation: `${totalCategoryItems.toLocaleString("es-AR")} publicaciones en la categoría "${categoryName}"`,
      quality:    `${Math.round(premiumRatio * 100)}% de publicaciones premium (gold special/pro)`,
      brands:     `${Math.round(brandsRatio * 100)}% de publicaciones de tiendas oficiales`,
    },
    topMatches,
  };
}
