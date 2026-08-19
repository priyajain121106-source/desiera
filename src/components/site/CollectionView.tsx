import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  allSizes,
  categories,
  colorGroups,
  formatINR,
  type Product,
} from "@/data/products";
import { cn } from "@/lib/utils";

type SortKey = "featured" | "newest" | "price-asc" | "price-desc";

const MAX_PRICE = 7000;

export function CollectionView({
  title,
  description,
  items,
  showCategoryFilter = true,
  emptyMessage = "No pieces match these filters yet.",
}: {
  title: string;
  description?: string;
  items: Product[];
  showCategoryFilter?: boolean;
  emptyMessage?: string;
}) {
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [sort, setSort] = useState<SortKey>("featured");

  const toggle = (
    value: string,
    list: string[],
    setter: (v: string[]) => void,
  ) =>
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const filtered = useMemo(() => {
    let out = items.filter((p) => {
      if (sizes.length && !p.sizes.some((s) => sizes.includes(s))) return false;
      if (colors.length && !colors.includes(p.colorGroup)) return false;
      if (cats.length && !cats.includes(p.category)) return false;
      if (inStockOnly && !p.inStock) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
    out = [...out];
    if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
    if (sort === "newest")
      out.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    return out;
  }, [items, sizes, colors, cats, inStockOnly, maxPrice, sort]);

  const activeCount =
    sizes.length + colors.length + cats.length + (inStockOnly ? 1 : 0) +
    (maxPrice < MAX_PRICE ? 1 : 0);

  const clearAll = () => {
    setSizes([]);
    setColors([]);
    setCats([]);
    setInStockOnly(false);
    setMaxPrice(MAX_PRICE);
  };

  const filterPanel = (
    <div className="space-y-8">
      <fieldset>
        <legend className="eyebrow">Size</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={sizes.includes(s)}
              onClick={() => toggle(s, sizes, setSizes)}
              className={cn(
                "min-w-11 border px-3 py-2 text-xs tracking-wide transition-colors",
                sizes.includes(s)
                  ? "border-foreground bg-foreground text-primary-foreground"
                  : "border-border hover:border-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow">Colour</legend>
        <div className="mt-3 space-y-2.5">
          {colorGroups.map((c) => (
            <label key={c.name} className="flex cursor-pointer items-center gap-3 text-sm">
              <Checkbox
                checked={colors.includes(c.name)}
                onCheckedChange={() => toggle(c.name, colors, setColors)}
              />
              <span
                className="size-4 rounded-full border border-border"
                style={{ backgroundColor: c.hex }}
                aria-hidden="true"
              />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      {showCategoryFilter ? (
        <fieldset>
          <legend className="eyebrow">Category</legend>
          <div className="mt-3 space-y-2.5">
            {categories.map((c) => (
              <label key={c.slug} className="flex cursor-pointer items-center gap-3 text-sm">
                <Checkbox
                  checked={cats.includes(c.slug)}
                  onCheckedChange={() => toggle(c.slug, cats, setCats)}
                />
                {c.name}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset>
        <legend className="eyebrow">Price</legend>
        <div className="mt-4">
          <Slider
            value={[maxPrice]}
            min={1000}
            max={MAX_PRICE}
            step={100}
            onValueChange={(v) => setMaxPrice(v[0] ?? MAX_PRICE)}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Up to {formatINR(maxPrice)}
          </p>
        </div>
      </fieldset>

      <fieldset>
        <legend className="eyebrow">Availability</legend>
        <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(v) => setInStockOnly(Boolean(v))}
          />
          In stock only
        </label>
      </fieldset>

      {activeCount > 0 ? (
        <Button variant="ghost" onClick={clearAll} className="px-0 text-xs uppercase tracking-[0.16em]">
          Clear all filters
        </Button>
      ) : null}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
      <header className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>

      <div className="mt-10 flex items-center justify-between gap-4 border-y border-border py-3">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] lg:hidden">
              <SlidersHorizontal className="size-4" />
              Filters{activeCount ? ` (${activeCount})` : ""}
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl font-normal">Filters</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-10">{filterPanel}</div>
            </SheetContent>
          </Sheet>
          <p className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          </p>
        </div>

        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-44 border-0 text-xs uppercase tracking-[0.14em] shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-10 flex gap-12">
        <aside className="hidden w-60 shrink-0 lg:block">{filterPanel}</aside>

        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="border border-dashed border-border px-6 py-24 text-center">
              <p className="font-display text-2xl">Nothing here yet</p>
              <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                {emptyMessage}
              </p>
              <Button variant="outline" className="mt-6" onClick={clearAll}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
