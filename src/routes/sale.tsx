import { createFileRoute } from "@tanstack/react-router";
import { CollectionView } from "@/components/site/CollectionView";
import { products } from "@/data/products";
import { seoRoute } from "@/lib/seo-route";

const onSale = products.filter((p) => p.compareAtPrice);

export const Route = createFileRoute("/sale")({
  ...seoRoute("/sale"),
  component: SalePage,
});

function SalePage() {
  return (
    <CollectionView
      title="Sale"
      description="Selected pieces at reduced prices. Limited sizes — once they're gone, they're gone."
      items={onSale}
      breadcrumbs={[{ label: "Sale" }]}
      emptyMessage="No reduced pieces match these filters right now."
    />
  );
}
