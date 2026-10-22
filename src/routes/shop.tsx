import { createFileRoute } from "@tanstack/react-router";
import { CollectionView } from "@/components/site/CollectionView";
import { products } from "@/data/products";
import { seoRoute } from "@/lib/seo-route";

export const Route = createFileRoute("/shop")({
  ...seoRoute("/shop"),
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
