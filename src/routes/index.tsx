import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, PackageCheck, Ruler, Sparkles, Truck } from "lucide-react";
import {
  bestSellers,
  categories,
  editorialImage,
  heroImage,
  newArrivals,
  products,
} from "@/data/products";
import { ProductCard } from "@/components/site/ProductCard";
import { Newsletter } from "@/components/site/Footer";
import bannerStyling from "@/assets/banner-styling.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HOK — Everyday Indian, Effortlessly Elevated" },
      {
        name: "description",
        content:
          "Contemporary kurtis, kurtas, kurta sets and co-ord sets from HOK. Free shipping across India with Cash on Delivery available.",
      },
      { property: "og:title", content: "HOK — Everyday Indian, Effortlessly Elevated" },
      {
        property: "og:description",
        content:
          "Contemporary kurtis, kurtas, kurta sets and co-ord sets designed for everyday wear.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="grid lg:grid-cols-[1fr_1.15fr]">
          <div className="order-2 flex items-center bg-secondary px-6 py-16 md:px-14 lg:order-1 lg:py-24">
            <div className="fade-up max-w-md">
              <p className="eyebrow">New Season</p>
              <h1 className="mt-5 text-5xl leading-[1.05] md:text-6xl">
                Everyday Indian,
                <br />
                <em className="not-italic text-accent">Effortlessly</em> Elevated.
              </h1>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Contemporary ethnicwear cut for real days — kurtis, kurtas and sets
                that move with you and style themselves.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/new-arrivals"
                  className="inline-flex items-center gap-2 bg-primary px-7 py-4 text-xs uppercase tracking-[0.16em] text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Shop New Arrivals <ArrowRight className="size-3.5" />
                </Link>
                <Link
                  to="/kurta-sets"
                  className="inline-flex items-center gap-2 border border-foreground px-7 py-4 text-xs uppercase tracking-[0.16em] transition-colors hover:bg-foreground hover:text-primary-foreground"
                >
                  Explore Sets
                </Link>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <img
              src={heroImage}
              alt="Model wearing an ivory and terracotta block-print kurti from HOK"
              width={1600}
              height={1200}
              className="h-[52vh] w-full object-cover object-top md:h-[70vh] lg:h-full"
            />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section aria-label="Store benefits" className="border-y border-border">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border md:grid-cols-4">
          {[
            { icon: Truck, label: "Free shipping across India" },
            { icon: PackageCheck, label: "Cash on Delivery available" },
            { icon: Ruler, label: "Detailed size guidance" },
            { icon: Sparkles, label: "Easy 7-day exchange" },
          ].map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center justify-center gap-3 px-4 py-5 text-center text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground"
            >
              <Icon className="size-4 shrink-0 text-accent" strokeWidth={1.4} />
              {label}
            </li>
          ))}
        </ul>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Shop by category</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Find your silhouette</h2>
          </div>
          <Link to="/shop" className="nav-link hidden shrink-0 md:block">
            View all
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.slug} to={`/${c.slug}`} className="group block">
              <div className="overflow-hidden bg-secondary">
                <img
                  src={c.image}
                  alt={`${c.name} collection`}
                  width={900}
                  height={1200}
                  loading="lazy"
                  className="aspect-3/4 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="mt-4 text-xl transition-colors group-hover:text-accent">
                {c.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{c.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <ProductRow
        eyebrow="Just in"
        title="New Arrivals"
        link="/new-arrivals"
        items={newArrivals.slice(0, 4)}
      />

      {/* Editorial */}
      <section className="bg-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 md:px-8 lg:grid-cols-2 lg:gap-16">
          <img
            src={editorialImage}
            alt="Model in a sage kurta set seated in natural light"
            width={1200}
            height={1504}
            loading="lazy"
            className="aspect-4/5 w-full object-cover"
          />
          <div className="max-w-md">
            <p className="eyebrow">Editorial</p>
            <h2 className="mt-4 text-4xl md:text-5xl">Made for Your Everyday</h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              One kurta, three ways. Layer it over trousers for work, let it fall
              alone on warm afternoons, add a dupatta when the evening asks for it.
              Our pieces are designed to be restyled, not retired.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 border-b border-foreground pb-1 text-xs uppercase tracking-[0.16em] transition-colors hover:border-accent hover:text-accent"
            >
              Shop the edit <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <ProductRow
        eyebrow="Loved most"
        title="Best Sellers"
        link="/shop"
        items={bestSellers.slice(0, 4)}
      />

      {/* Why HOK */}
      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="max-w-xl">
            <p className="eyebrow">Why HOK</p>
            <h2 className="mt-3 text-3xl md:text-4xl">
              Considered pieces, quietly made
            </h2>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                t: "Thoughtfully designed",
                d: "Every silhouette is drafted and refined in-house before it reaches the collection.",
              },
              {
                t: "Easy to style",
                d: "Pieces are built to pair — with each other, and with what you already own.",
              },
              {
                t: "Quality-focused",
                d: "We check fit, finish and construction on every style before it goes live.",
              },
              {
                t: "Everyday comfort",
                d: "Cuts that let you sit, move and work without adjusting all day.",
              },
            ].map((f) => (
              <div key={f.t} className="border-t border-border pt-6">
                <h3 className="text-xl">{f.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {f.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Styling banner */}
      <section className="relative">
        <img
          src={bannerStyling}
          alt="Two models wearing HOK co-ord sets in a sunlit courtyard"
          width={1920}
          height={912}
          loading="lazy"
          className="h-[46vh] w-full object-cover md:h-[60vh]"
        />
        <div className="absolute inset-0 flex items-center bg-linear-to-r from-background/85 via-background/40 to-transparent">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
            <div className="max-w-sm">
              <p className="eyebrow">Styling</p>
              <h2 className="mt-3 text-4xl md:text-5xl">Sets that move with you</h2>
              <Link
                to="/co-ord-sets"
                className="mt-7 inline-flex items-center gap-2 bg-primary px-7 py-4 text-xs uppercase tracking-[0.16em] text-primary-foreground"
              >
                Discover Co-ords <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social gallery */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="text-center">
          <p className="eyebrow">@hok</p>
          <h2 className="mt-3 text-3xl md:text-4xl">Styled by you</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Tag us to be featured. Image slots below are placeholders — swap in your
            own posts.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-6">
          {products.slice(0, 6).map((p) => (
            <a
              key={p.id}
              href="#"
              aria-label={`Social post featuring ${p.name}`}
              className="group relative block overflow-hidden bg-secondary"
            >
              <img
                src={p.images[0]}
                alt=""
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </a>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  );
}

function ProductRow({
  eyebrow,
  title,
  link,
  items,
}: {
  eyebrow: string;
  title: string;
  link: "/new-arrivals" | "/shop";
  items: typeof products;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-3 text-3xl md:text-4xl">{title}</h2>
        </div>
        <Link to={link} className="nav-link shrink-0">
          View all
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
