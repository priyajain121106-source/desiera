import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Desi Era monogram mark — refined, minimal, feminine-modern. */
export function Monogram({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full border border-accent/50 font-display text-[0.9rem] tracking-[0.06em] text-accent transition-colors",
        className,
      )}
    >
      DE
    </span>
  );
}

/** Desi Era wordmark — monogram + selectively used full name. */
export function Logo({
  className,
  size = "md",
  withMonogram = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  withMonogram?: boolean;
}) {
  const sizes = {
    sm: "text-base tracking-[0.3em] pl-[0.3em]",
    md: "text-lg md:text-xl tracking-[0.32em] pl-[0.32em]",
    lg: "text-3xl md:text-4xl tracking-[0.34em] pl-[0.34em]",
  };
  return (
    <Link
      to="/"
      aria-label="Desi Era — home"
      className={cn("group inline-flex items-center gap-3 leading-none", className)}
    >
      {withMonogram ? (
        <Monogram className="group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground" />
      ) : null}
      <span className="flex flex-col">
        <span
          className={cn(
            "font-display uppercase text-foreground transition-colors group-hover:text-accent",
            sizes[size],
          )}
        >
          Desi Era
        </span>
        <span className="mt-1 hidden text-[0.5rem] uppercase tracking-[0.34em] pl-[0.34em] text-muted-foreground sm:block">
          Indian Ethnicwear
        </span>
      </span>
    </Link>
  );
}
