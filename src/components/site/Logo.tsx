import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** HOK wordmark — refined, minimal, feminine-modern. */
export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-xl",
    md: "text-2xl md:text-3xl",
    lg: "text-4xl md:text-5xl",
  };
  return (
    <Link
      to="/"
      aria-label="HOK — home"
      className={cn("group inline-flex flex-col items-center leading-none", className)}
    >
      <span
        className={cn(
          "font-display tracking-[0.34em] pl-[0.34em] text-foreground transition-colors group-hover:text-accent",
          sizes[size],
        )}
      >
        HOK
      </span>
      <span className="mt-1 hidden text-[0.5rem] uppercase tracking-[0.42em] pl-[0.42em] text-muted-foreground sm:block">
        Ethnicwear
      </span>
    </Link>
  );
}
