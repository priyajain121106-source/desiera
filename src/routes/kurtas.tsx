import { createFileRoute } from "@tanstack/react-router";
import { CollectionView } from "@/components/site/CollectionView";
import { pageHead } from "@/lib/seo";
import { categoryBySlug, productsByCategory } from "@/data/products";

const category = categoryBySlug("kurtas")!;
const items = productsByCategory("kurtas");

export const Route = createFileRoute("/kurtas")({
  head: () =>
    pageHead(
      "Women's Kurtas — HOK",
      "Shop women's Kurtas at HOK — ${category.tagline.toLowerCase()}. Free shipping across India, Cash on Delivery available.",
    ),
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
