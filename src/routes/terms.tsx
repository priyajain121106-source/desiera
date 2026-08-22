import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, Section } from "@/components/site/StaticPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageHead(
      "Terms & Conditions — HOK",
      "The terms that govern your use of the HOK website and any order you place with us.",
    ),
  component: TermsPage,
});

function TermsPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="Template terms — have them reviewed by a legal advisor and update them with your registered entity details before launch."
    >
      <Section heading="Use of this website">
        <p>
          By browsing or ordering from this website you agree to these terms. Please
          do not use the site if you do not accept them.
        </p>
      </Section>
      <Section heading="Products and pricing">
        <p>
          All prices are in Indian Rupees and inclusive of applicable taxes. We may
          update prices, product descriptions and availability at any time.
        </p>
      </Section>
      <Section heading="Colour and finish">
        <p>
          Photography is styled to represent each garment as closely as possible.
          Slight variation in colour and hand-finished detail is normal.
        </p>
      </Section>
      <Section heading="Orders">
        <p>
          An order is confirmed once accepted by us. We may cancel an order due to
          stock or payment issues and will refund any amount paid.
        </p>
      </Section>
      <Section heading="Intellectual property">
        <p>
          All content on this site, including imagery and the HOK name, belongs to
          us and may not be reused without permission.
        </p>
      </Section>
      <Section heading="Governing law">
        <p>
          These terms are governed by the laws of India. Add your jurisdiction and
          registered entity details here.
        </p>
      </Section>
    </StaticPage>
  );
}
