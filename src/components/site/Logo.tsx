import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import desiEraMark from "@/assets/desi-era-mark.png.asset.json";

export function Monogram({ className }: { className?: string }) {
  return (
    <img
      src={desiEraMark.url}
      alt=""
      width={512}
      height={512}
      className={cn(
        "size-10 shrink-0 object-contain",
        className,
      )}
    />
  );
}

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
    lg: "text-2xl md:text-3xl tracking-[0.34em] pl-[0.34em]",
  };
  const markSizes = {
    sm: "size-9",
    md: "size-11",
    lg: "size-14",
  };
  return (
    <Link
      to="/"
      aria-label="Desi Era — home"
      className={cn("group inline-flex items-center gap-3 leading-none", className)}
    >
      {withMonogram ? (
        <Monogram className={cn("transition-transform duration-300 group-hover:scale-105", markSizes[size])} />
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
