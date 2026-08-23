import { createFileRoute } from "@tanstack/react-router";
import { CollectionView } from "@/components/site/CollectionView";
import { pageHead } from "@/lib/seo";
import { categoryBySlug, productsByCategory } from "@/data/products";

const category = categoryBySlug("kurtis")!;
const items = productsByCategory("kurtis");

export const Route = createFileRoute("/kurtis")({
  head: () =>
    pageHead(
      "Women's Kurtis — Desi Era",
      "Shop women's Kurtis at Desi Era for everyday wear. Free shipping across India, Cash on Delivery available.",
    ),
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
