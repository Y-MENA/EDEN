export interface MLProductItem {
  item_id: string;
  seller_id: number;
  official_store_id?: number | null;
  listing_type_id: string;
  price: number;
  category_id: string;
}

export interface MLProductItemsResponse {
  paging: { total: number; offset: number; limit: number };
  results: MLProductItem[];
}

export interface MLCategory {
  id: string;
  name: string;
}

export interface MLCategoryStats {
  id: string;
  name: string;
  total_items_in_this_category: number;
  children_categories: MLCategory[];
  picture?: string;
}

export interface MLDomainDiscoveryResult {
  domain_id: string;
  domain_name: string;
  category_id: string;
  category_name: string;
}

export interface MLHighlightsResponse {
  content: { id: string; type: "ITEM" | "PRODUCT"; position: number }[];
}

export interface MarketSample {
  categoryId: string;
  categoryName: string;
  totalCategoryItems: number;
  items: MLProductItem[];
}

export interface ScoreCriteria {
  sellers: number;
  saturation: number;
  quality: number;
  brands: number;
}

export interface AnalysisResult {
  query: string;
  categoryName: string;
  totalListings: number;
  uniqueSellers: number;
  officialStores: number;
  premiumListingsRatio: number;
  score: number;
  criteria: ScoreCriteria;
  verdict: "Excelente" | "Bueno" | "Regular" | "Saturado";
  details: {
    sellers: string;
    saturation: string;
    quality: string;
    brands: string;
  };
}

export interface SubcategoryRanking {
  categoryId: string;
  categoryName: string;
  score: number;
  verdict: AnalysisResult["verdict"];
  totalListings: number;
  uniqueSellers: number;
  premiumListingsRatio: number;
}
