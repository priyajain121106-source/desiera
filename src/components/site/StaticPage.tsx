import type { ReactNode } from "react";

export function StaticPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1 className="mt-4 text-4xl md:text-5xl">{title}</h1>
      {intro ? (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">{intro}</p>
      ) : null}
      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground [&_h2]:text-xl [&_h2]:text-foreground [&_strong]:text-foreground">
        {children}
      </div>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2>{heading}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
