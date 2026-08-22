import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage, Section } from "@/components/site/StaticPage";
import { editorialImage } from "@/data/products";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead(
      "About HOK — House of Kurti",
      "HOK is a contemporary Indian ethnicwear label making kurtis, kurtas and sets designed for everyday wear.",
    ),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="grid lg:grid-cols-2">
        <div className="flex items-center bg-secondary px-6 py-16 md:px-14 lg:py-24">
          <div className="max-w-md">
            <p className="eyebrow">About</p>
            <h1 className="mt-5 text-5xl leading-[1.05] md:text-6xl">
              House of Kurti
            </h1>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              HOK makes contemporary Indian ethnicwear for everyday life — kurtis,
              kurtas, kurta sets and co-ord sets that are easy to wear, easy to
              restyle, and quietly considered in their detail.
            </p>
          </div>
        </div>
        <img
          src={editorialImage}
          alt="HOK kurta set photographed in natural light"
          loading="lazy"
          className="h-[46vh] w-full object-cover lg:h-full"
        />
      </section>

      <StaticPage title="Our approach">
        <Section heading="What we make">
          <p>
            Our range is deliberately focused: <strong>kurtis, kurtas, kurta
            sets and co-ord sets</strong>. We would rather refine a tight edit of
            silhouettes than stretch across categories.
          </p>
        </Section>
        <Section heading="How we design">
          <p>
            Every style is drafted and fitted before it enters the collection. We
            look at how a piece sits when you are seated, reaching, or moving
            through a full day — not only how it photographs.
          </p>
        </Section>
        <Section heading="Made to be restyled">
          <p>
            Pieces are built to pair with each other and with what you already own.
            A kurta worn alone in summer becomes a layer in winter.
          </p>
        </Section>
        <Section heading="Get in touch">
          <p>
            Questions about fit, fabric or an order? Visit our{" "}
            <Link to="/contact" className="text-accent underline-offset-4 hover:underline">
              contact page
            </Link>{" "}
            or read the{" "}
            <Link to="/faq" className="text-accent underline-offset-4 hover:underline">
              FAQ
            </Link>
            .
          </p>
        </Section>
      </StaticPage>
    </>
  );
}
