import { createFileRoute } from "@tanstack/react-router";
import { CollectionView } from "@/components/site/CollectionView";
import { categoryBySlug, productsByCategory } from "@/data/products";
import { seoRoute } from "@/lib/seo-route";

const category = categoryBySlug("kurta-sets")!;
const items = productsByCategory("kurta-sets");

export const Route = createFileRoute("/kurta-sets")({
  ...seoRoute("/kurta-sets"),
  component: CategoryPage,
});

function CategoryPage() {
  return (
    <CollectionView
      title="Women's Kurta Sets"
      description={category.tagline + ". Cut for real days, styled your way."}
      items={items}
      showCategoryFilter={false}
      breadcrumbs={[{ label: "Kurta Sets" }]}
    />
  );
}
