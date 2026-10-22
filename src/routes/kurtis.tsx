import { createFileRoute } from "@tanstack/react-router";
import { CollectionView } from "@/components/site/CollectionView";
import { categoryBySlug, productsByCategory } from "@/data/products";
import { seoRoute } from "@/lib/seo-route";

const category = categoryBySlug("kurtis")!;
const items = productsByCategory("kurtis");

export const Route = createFileRoute("/kurtis")({
  ...seoRoute("/kurtis"),
  component: CategoryPage,
});

function CategoryPage() {
  return (
    <CollectionView
      title="Women's Kurtis"
      description={category.tagline + ". Cut for real days, styled your way."}
      items={items}
      showCategoryFilter={false}
      breadcrumbs={[{ label: "Kurtis" }]}
    />
  );
}
