import { createFileRoute } from "@tanstack/react-router";
import { CollectionView } from "@/components/site/CollectionView";
import { newArrivals } from "@/data/products";
import { seoRoute } from "@/lib/seo-route";

export const Route = createFileRoute("/new-arrivals")({
  ...seoRoute("/new-arrivals"),
  component: NewArrivals,
});

function NewArrivals() {
  return (
    <CollectionView
      title="New Arrivals"
      description="The latest additions to the Desi Era wardrobe — new prints, new silhouettes, same everyday ease."
      items={newArrivals}
      breadcrumbs={[{ label: "New Arrivals" }]}
    />
  );
}
