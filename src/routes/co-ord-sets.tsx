import { createFileRoute } from "@tanstack/react-router";
import { CollectionView } from "@/components/site/CollectionView";
import { categoryBySlug, productsByCategory } from "@/data/products";
import { seoRoute } from "@/lib/seo-route";

const category = categoryBySlug("co-ord-sets")!;
const items = productsByCategory("co-ord-sets");

export const Route = createFileRoute("/co-ord-sets")({
  ...seoRoute("/co-ord-sets"),
  component: CategoryPage,
});

function CategoryPage() {
  return (
    <CollectionView
      title="Women's Co-ord Sets"
      description={category.tagline + ". Cut for real days, styled your way."}
      items={items}
      showCategoryFilter={false}
      breadcrumbs={[{ label: "Co-ord Sets" }]}
    />
  );
}
