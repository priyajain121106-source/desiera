import { createFileRoute } from "@tanstack/react-router";
import { CollectionView } from "@/components/site/CollectionView";
import { pageHead } from "@/lib/seo";
import { products } from "@/data/products";

export const Route = createFileRoute("/shop")({
  head: () =>
    pageHead(
      "Shop All — Desi Era",
      "Browse the full Desi Era collection of kurtis, kurtas, kurta sets and co-ord sets.",
    ),
  component: ShopPage,
});

function ShopPage() {
  return (
    <CollectionView
      title="Shop All"
      description="Every Desi Era piece in one place — kurtis, kurtas, kurta sets and co-ord sets."
      items={products}
      breadcrumbs={[{ label: "Shop All" }]}
    />
  );
}
