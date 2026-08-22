import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Lock } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { formatINR } from "@/data/products";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/checkout")({
  head: () =>
    pageHead(
      "Checkout — HOK",
      "Complete your HOK order with free shipping across India and Cash on Delivery on eligible pincodes.",
    ),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { activeLines, subtotal, clearCart } = useStore();
  const [placed, setPlaced] = useState(false);
  const [payment, setPayment] = useState("cod");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (activeLines.length === 0) return;
    setPlaced(true);
    clearCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <CheckCircle2 className="mx-auto size-10 text-accent" strokeWidth={1.2} />
        <h1 className="mt-6 text-4xl">Order placed</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          This is a front-end demo checkout — no payment was taken and no order was
          sent. Connect a payments and order backend before launch.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/shop">Continue shopping</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/account">View account</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (activeLines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-4xl">Nothing to check out</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Add a piece to your bag to continue.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link to="/new-arrivals">Shop New Arrivals</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <Breadcrumbs
        items={[{ label: "Shopping Bag", to: "/cart" }, { label: "Checkout" }]}
      />
      <h1 className="mt-4 text-4xl md:text-5xl">Checkout</h1>

      <form
        onSubmit={submit}
        className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14"
      >
        <div className="space-y-12">
          <section>
            <h2 className="eyebrow">Contact</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field id="email" label="Email" type="email" required />
              <Field id="phone" label="Phone" type="tel" required />
            </div>
          </section>

          <section>
            <h2 className="eyebrow">Shipping Address</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field id="first" label="First name" required />
              <Field id="last" label="Last name" required />
              <div className="sm:col-span-2">
                <Field id="address" label="Address" required />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="landmark" className="text-xs uppercase tracking-[0.14em]">
                  Landmark (optional)
                </Label>
                <Textarea id="landmark" rows={2} className="mt-2" />
              </div>
              <Field id="city" label="City" required />
              <Field id="state" label="State" required />
              <Field id="pincode" label="Pincode" inputMode="numeric" required />
              <Field id="country" label="Country" defaultValue="India" required />
            </div>
          </section>

          <section>
            <h2 className="eyebrow">Payment</h2>
            <RadioGroup
              value={payment}
              onValueChange={setPayment}
              className="mt-5 space-y-3"
            >
              {[
                { id: "cod", label: "Cash on Delivery", note: "Eligible pincodes only" },
                { id: "upi", label: "UPI", note: "Demo placeholder" },
                { id: "card", label: "Credit / Debit Card", note: "Demo placeholder" },
              ].map((m) => (
                <label
                  key={m.id}
                  htmlFor={m.id}
                  className="flex cursor-pointer items-center gap-3 border border-border p-4 transition-colors has-[:checked]:border-accent"
                >
                  <RadioGroupItem id={m.id} value={m.id} />
                  <span className="flex-1 text-sm">{m.label}</span>
                  <span className="text-xs text-muted-foreground">{m.note}</span>
                </label>
              ))}
            </RadioGroup>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3.5" /> Demo checkout — no payment is processed.
            </p>
          </section>
        </div>

        <aside className="h-fit border border-border bg-secondary p-6 lg:sticky lg:top-28">
          <h2 className="eyebrow">Your Order</h2>
          <ul className="mt-5 space-y-4">
            {activeLines.map((l) => (
              <li key={`${l.productId}-${l.size}`} className="flex gap-3">
                <img
                  src={l.product.images[0]}
                  alt={l.product.name}
                  loading="lazy"
                  className="aspect-3/4 w-14 object-cover"
                />
                <div className="flex-1 text-sm">
                  <p>{l.product.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Size {l.size} · Qty {l.qty}
                  </p>
                </div>
                <p className="text-sm">{formatINR(l.product.price * l.qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-accent">Free</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base">
              <dt>Total</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
          </dl>
          <Button type="submit" size="lg" className="mt-6 h-12 w-full">
            Place Order
          </Button>
          <button
            type="button"
            onClick={() => navigate({ to: "/cart" })}
            className="mt-4 w-full text-center text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-accent"
          >
            Back to bag
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  ...props
}: { id: string; label: string } & React.ComponentProps<typeof Input>) {
  return (
    <div>
      <Label htmlFor={id} className="text-xs uppercase tracking-[0.14em]">
        {label}
      </Label>
      <Input id={id} className="mt-2 h-11" {...props} />
    </div>
  );
}
