import { createFileRoute } from "@tanstack/react-router";
import { CollectionView } from "@/components/site/CollectionView";
import { pageHead } from "@/lib/seo";
import { categoryBySlug, productsByCategory } from "@/data/products";

const category = categoryBySlug("co-ord-sets")!;
const items = productsByCategory("co-ord-sets");

export const Route = createFileRoute("/co-ord-sets")({
  head: () =>
    pageHead(
      "Women's Co-ord Sets — HOK",
      "Shop women's Co-ord Sets at HOK — ${category.tagline.toLowerCase()}. Free shipping across India, Cash on Delivery available.",
    ),
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
