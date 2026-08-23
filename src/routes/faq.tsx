import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () =>
    pageHead(
      "FAQ — Desi Era",
      "Answers on sizing, fabrics, shipping, Cash on Delivery, exchanges and order tracking at Desi Era.",
    ),
  component: FaqPage,
});

const faqs = [
  {
    q: "What sizes do you offer?",
    a: "Most styles run XS to XXL. Exact sizes available are listed on each product page, and our size guide has full body measurements.",
  },
  {
    q: "How do I choose the right size?",
    a: "Measure your bust, waist and hip and compare against the size guide. Size up for a relaxed drape on straight kurtas and co-ord sets.",
  },
  {
    q: "Do you ship across India?",
    a: "Yes, with free shipping on all orders. Timelines are listed on the Shipping & Delivery page.",
  },
  {
    q: "Is Cash on Delivery available?",
    a: "COD is available on eligible pincodes. You can check availability on any product page.",
  },
  {
    q: "Can I exchange for a different size?",
    a: "Size exchanges can be requested within 7 days of delivery, subject to stock. Items must be unworn with tags intact.",
  },
  {
    q: "How do I care for my garment?",
    a: "Care instructions are listed under Fabric & Care on each product page. As a rule, gentle cold wash and dry in shade preserves colour.",
  },
  {
    q: "How do I track my order?",
    a: "A tracking link is sent by email and SMS once your order ships.",
  },
];

function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <Breadcrumbs items={[{ label: "FAQ" }]} />
      <p className="eyebrow mt-4">Help</p>
      <h1 className="mt-4 text-4xl md:text-5xl">Frequently Asked Questions</h1>

      <Accordion type="single" collapsible className="mt-10">
        {faqs.map((f) => (
          <AccordionItem key={f.q} value={f.q}>
            <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <p className="mt-10 text-sm text-muted-foreground">
        Still need help?{" "}
        <Link to="/contact" className="text-accent underline-offset-4 hover:underline">
          Contact us
        </Link>
        .
      </p>
    </div>
  );
}
