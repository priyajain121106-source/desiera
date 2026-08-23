import { createFileRoute, Link } from "@tanstack/react-router";
import { StaticPage, Section } from "@/components/site/StaticPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/shipping")({
  head: () =>
    pageHead(
      "Shipping & Delivery — Desi Era",
      "Shipping timelines, Cash on Delivery availability and order tracking for Desi Era orders across India.",
    ),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <StaticPage
      eyebrow="Help"
      title="Shipping & Delivery"
      intro="Free shipping across India. The timelines below are placeholders — confirm them with your logistics partner before launch."
    >
      <Section heading="Dispatch">
        <p>Orders are dispatched within 1–3 business days of confirmation.</p>
      </Section>
      <Section heading="Delivery timelines">
        <p>Metro cities: 3–5 business days after dispatch.</p>
        <p>Rest of India: 5–8 business days after dispatch.</p>
      </Section>
      <Section heading="Shipping charges">
        <p>
          <strong>Free shipping</strong> on all prepaid and Cash on Delivery orders
          within India.
        </p>
      </Section>
      <Section heading="Cash on Delivery">
        <p>
          COD is available on eligible pincodes. You can check availability using the
          delivery checker on any product page.
        </p>
      </Section>
      <Section heading="Tracking">
        <p>
          A tracking link is shared by email and SMS once your order ships. For help,{" "}
          <Link to="/contact" className="text-accent underline-offset-4 hover:underline">
            contact us
          </Link>
          .
        </p>
      </Section>
    </StaticPage>
  );
}
