import { createFileRoute } from "@tanstack/react-router";
import { CollectionView } from "@/components/site/CollectionView";
import { pageHead } from "@/lib/seo";
import { categoryBySlug, productsByCategory } from "@/data/products";

const category = categoryBySlug("kurta-sets")!;
const items = productsByCategory("kurta-sets");

export const Route = createFileRoute("/kurta-sets")({
  head: () =>
    pageHead(
      "Women's Kurta Sets — HOK",
      "Shop women's Kurta Sets at HOK for everyday wear. Free shipping across India, Cash on Delivery available.",
    ),
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
