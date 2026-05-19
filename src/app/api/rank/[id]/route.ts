import { NextRequest, NextResponse } from "next/server";
import { getCategoryWithChildren, buildMarketSampleById } from "@/lib/mercadolibre";
import { analyzeMarket } from "@/lib/scorer";
import type { SubcategoryRanking } from "@/types";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const category = await getCategoryWithChildren(id);
    const children = category.children_categories;

    if (!children.length) {
      // Leaf category — analyze it directly
      const sample = await buildMarketSampleById(id);
      const result = analyzeMarket(category.name, sample);
      const ranking: SubcategoryRanking[] = [
        {
          categoryId: id,
          categoryName: category.name,
          score: result.score,
          verdict: result.verdict,
          totalListings: result.totalListings,
          uniqueSellers: result.uniqueSellers,
          premiumListingsRatio: result.premiumListingsRatio,
        },
      ];
      return NextResponse.json(ranking);
    }

    // Analyze all children in parallel (cap at 15 to avoid timeout)
    const targets = children.slice(0, 15);
    const results = await Promise.all(
      targets.map(async (child): Promise<SubcategoryRanking | null> => {
        try {
          const sample = await buildMarketSampleById(child.id);
          const result = analyzeMarket(child.name, sample);
          return {
            categoryId: child.id,
            categoryName: child.name,
            score: result.score,
            verdict: result.verdict,
            totalListings: result.totalListings,
            uniqueSellers: result.uniqueSellers,
            premiumListingsRatio: result.premiumListingsRatio,
          };
        } catch {
          return null;
        }
      })
    );

    const ranking = results
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score) as SubcategoryRanking[];

    return NextResponse.json(ranking);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
