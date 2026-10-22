import { createFileRoute } from "@tanstack/react-router";
import { CollectionView } from "@/components/site/CollectionView";
import { categoryBySlug, productsByCategory } from "@/data/products";
import { seoRoute } from "@/lib/seo-route";

const category = categoryBySlug("kurtas")!;
const items = productsByCategory("kurtas");

export const Route = createFileRoute("/kurtas")({
  ...seoRoute("/kurtas"),
  component: CategoryPage,
});

function CategoryPage() {
  return (
    <CollectionView
      title="Women's Kurtas"
      description={category.tagline + ". Cut for real days, styled your way."}
      items={items}
      showCategoryFilter={false}
      breadcrumbs={[{ label: "Kurtas" }]}
    />
  );
}
