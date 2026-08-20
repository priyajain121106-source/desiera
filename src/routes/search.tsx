import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon } from "lucide-react";
import { CollectionView } from "@/components/site/CollectionView";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { bestSellers, categories, products } from "@/data/products";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  head: () =>
    pageHead(
      "Search — HOK",
      "Search the HOK collection of kurtis, kurtas, kurta sets and co-ord sets.",
    ),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [value, setValue] = useState(q);

  const term = q.trim().toLowerCase().slice(0, 100);
  const results = term
    ? products.filter((p) =>
        [p.name, p.colorName, p.category, p.description]
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
    : products;

  const searchBar = (
    <form
      className="mt-8 flex max-w-lg items-center gap-3 border-b border-border pb-3"
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/search", search: { q: value } });
      }}
      role="search"
    >
      <SearchIcon className="size-4 text-muted-foreground" aria-hidden="true" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search kurtis, kurtas, sets…"
        aria-label="Search products"
        className="border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
      />
      <Button type="submit" variant="ghost" className="text-xs uppercase tracking-[0.16em]">
        Search
      </Button>
    </form>
  );

  const recommendations = (
    <div>
      <p className="eyebrow">You may like</p>
      <h2 className="mt-3 font-display text-2xl">Best sellers</h2>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
        {bestSellers.slice(0, 3).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to={`/${c.slug}`}
            className="border border-border px-4 py-2 text-xs uppercase tracking-[0.16em] transition-colors hover:border-foreground"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <CollectionView
      title={term ? `Search: “${q.trim()}”` : "Search"}
      description={
        term
          ? `${results.length} ${results.length === 1 ? "piece" : "pieces"} matching your search.`
          : "Look for a style, a colour or a category."
      }
      items={results}
      breadcrumbs={[{ label: "Search" }]}
      headerSlot={searchBar}
      emptyMessage="We couldn't find a match. Try a different word, or explore the edit below."
      emptySlot={recommendations}
    />
  );
}
