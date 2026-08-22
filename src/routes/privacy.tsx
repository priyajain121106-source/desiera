import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, Section } from "@/components/site/StaticPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead(
      "Privacy Policy — HOK",
      "How HOK collects, uses and protects your personal information.",
    ),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="Template policy — have it reviewed by a legal advisor and update it with your registered entity details before launch."
    >
      <Section heading="Information we collect">
        <p>
          Contact details, shipping address and order history you provide at
          checkout, plus basic usage data from your visit to this website.
        </p>
      </Section>
      <Section heading="How we use it">
        <p>
          To process and deliver orders, respond to support requests, and — with
          your consent — send occasional updates about new arrivals.
        </p>
      </Section>
      <Section heading="Sharing">
        <p>
          We share only what is necessary with logistics and payment partners. We do
          not sell your personal information.
        </p>
      </Section>
      <Section heading="Cookies">
        <p>
          We use cookies and local storage to keep your bag and wishlist between
          visits and to understand site usage.
        </p>
      </Section>
      <Section heading="Your rights">
        <p>
          You can request access to, correction of, or deletion of your personal
          data by contacting us.
        </p>
      </Section>
      <Section heading="Contact">
        <p>Add your registered business name, address and privacy contact email here.</p>
      </Section>
    </StaticPage>
  );
}
