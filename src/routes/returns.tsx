import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage, Section } from "@/components/site/StaticPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/returns")({
  head: () =>
    pageHead(
      "Returns & Exchange — HOK",
      "How to request a return or size exchange on HOK kurtis, kurtas and sets.",
    ),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <StaticPage
      eyebrow="Help"
      title="Returns & Exchange"
      intro="Policy placeholder — review and confirm these terms with your operations team before launch."
    >
      <Section heading="Exchange window">
        <p>
          Size exchanges can be requested within <strong>7 days</strong> of
          delivery, subject to stock availability.
        </p>
      </Section>
      <Section heading="Condition">
        <p>
          Items must be unworn and unwashed, with original tags and packaging
          intact.
        </p>
      </Section>
      <Section heading="How to request">
        <p>
          Email us from the address used at checkout with your order number and the
          size you need. See{" "}
          <Link to="/contact" className="text-accent underline-offset-4 hover:underline">
            contact
          </Link>{" "}
          for details.
        </p>
      </Section>
      <Section heading="Non-returnable">
        <p>Sale items and altered garments are not eligible for return or exchange.</p>
      </Section>
      <Section heading="Refunds">
        <p>
          Approved refunds are processed to the original payment method within 7–10
          business days of the returned item being received and inspected.
        </p>
      </Section>
    </StaticPage>
  );
}
