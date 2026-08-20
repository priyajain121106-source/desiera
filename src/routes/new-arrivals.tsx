import { createFileRoute } from "@tanstack/react-router";
import { CollectionView } from "@/components/site/CollectionView";
import { pageHead } from "@/lib/seo";
import { newArrivals } from "@/data/products";

export const Route = createFileRoute("/new-arrivals")({
  head: () =>
    pageHead(
      "New Arrivals — HOK",
      "The newest kurtis, kurtas and sets from HOK. Fresh silhouettes for everyday Indian dressing.",
    ),
  component: NewArrivals,
});

function NewArrivals() {
  return (
    <CollectionView
      title="New Arrivals"
      description="The latest additions to the HOK wardrobe — new prints, new silhouettes, same everyday ease."
      items={newArrivals}
      breadcrumbs={[{ label: "New Arrivals" }]}
    />
  );
}
