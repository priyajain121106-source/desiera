import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead(
      "Contact Us — Desi Era",
      "Questions about fit, fabric, an order or an exchange? Get in touch with the Desi Era team.",
    ),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <h1 className="mt-4 text-4xl md:text-5xl">Contact Us</h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
        We reply to most messages within two business days. For order queries,
        include your order number.
      </p>

      <div className="mt-12 grid gap-12 md:grid-cols-[1fr_1.3fr]">
        <div className="space-y-8 text-sm">
          {[
            { icon: Mail, t: "Email", d: "Add your support email address here." },
            { icon: MessageCircle, t: "WhatsApp", d: "Add your support number here." },
            { icon: Clock, t: "Hours", d: "Mon–Sat, 10am – 6pm IST." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="border-t border-border pt-5">
              <Icon className="size-4 text-accent" strokeWidth={1.4} />
              <h2 className="mt-3 text-lg">{t}</h2>
              <p className="mt-1 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>

        <form
          className="space-y-5 border border-border bg-secondary p-6 md:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            toast.success("Message noted", {
              description: "This demo form isn't connected to a mailbox yet.",
            });
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="name" className="text-xs uppercase tracking-[0.14em]">
                Name
              </Label>
              <Input id="name" required className="mt-2 h-11 bg-background" />
            </div>
            <div>
              <Label htmlFor="cemail" className="text-xs uppercase tracking-[0.14em]">
                Email
              </Label>
              <Input id="cemail" type="email" required className="mt-2 h-11 bg-background" />
            </div>
          </div>
          <div>
            <Label htmlFor="order" className="text-xs uppercase tracking-[0.14em]">
              Order number (optional)
            </Label>
            <Input id="order" className="mt-2 h-11 bg-background" />
          </div>
          <div>
            <Label htmlFor="message" className="text-xs uppercase tracking-[0.14em]">
              Message
            </Label>
            <Textarea id="message" rows={6} required className="mt-2 bg-background" />
          </div>
          <Button type="submit" size="lg" className="h-12 w-full">
            Send message
          </Button>
          {sent ? (
            <p className="text-xs text-muted-foreground">
              Thanks — connect this form to your inbox or Lovable Cloud before launch.
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
