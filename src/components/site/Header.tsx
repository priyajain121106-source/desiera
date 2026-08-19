import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";

export const navLinks = [
  { label: "New Arrivals", to: "/new-arrivals" as const },
  { label: "Kurtis", to: "/kurtis" as const },
  { label: "Kurtas", to: "/kurtas" as const },
  { label: "Kurta Sets", to: "/kurta-sets" as const },
  { label: "Co-ord Sets", to: "/co-ord-sets" as const },
  { label: "Sale", to: "/sale" as const },
];

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[0.6875rem] uppercase tracking-[0.22em]">
        Free Shipping <span className="mx-2 text-accent">•</span> Cash on Delivery
        Available
      </p>
    </div>
  );
}

export function Header() {
  const { cartCount, setCartOpen, wishlist } = useStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    navigate({ to: "/search", search: { q: query } });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div className="flex flex-1 items-center gap-2 lg:hidden">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger aria-label="Open menu" className="p-1">
              <Menu className="size-5" strokeWidth={1.4} />
            </SheetTrigger>
            <SheetContent side="left" className="w-[86vw] max-w-xs p-0">
              <nav className="flex flex-col px-6 pt-10">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    className="border-b border-border py-4 font-display text-2xl"
                  >
                    {l.label}
                  </Link>
                ))}
                <Link
                  to="/shop"
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-border py-4 font-display text-2xl"
                >
                  All Products
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className="py-4 text-xs uppercase tracking-[0.16em] text-muted-foreground"
                >
                  About HOK
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden flex-1 lg:block">
          <Logo size="md" className="items-start" />
        </div>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-7 lg:flex"
        >
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="nav-link"
              activeProps={{ className: "nav-link text-accent" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="lg:hidden">
          <Logo size="sm" />
        </div>

        <div className="flex flex-1 items-center justify-end gap-1 md:gap-3">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
            className="p-2 transition-colors hover:text-accent"
          >
            {searchOpen ? (
              <X className="size-5" strokeWidth={1.4} />
            ) : (
              <Search className="size-5" strokeWidth={1.4} />
            )}
          </button>
          <Link
            to="/account"
            aria-label="Account"
            className="hidden p-2 transition-colors hover:text-accent sm:block"
          >
            <User className="size-5" strokeWidth={1.4} />
          </Link>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative p-2 transition-colors hover:text-accent"
          >
            <Heart className="size-5" strokeWidth={1.4} />
            {wishlist.length > 0 ? (
              <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-accent text-[0.5625rem] text-accent-foreground">
                {wishlist.length}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label="Open bag"
            onClick={() => setCartOpen(true)}
            className="relative p-2 transition-colors hover:text-accent"
          >
            <ShoppingBag className="size-5" strokeWidth={1.4} />
            {cartCount > 0 ? (
              <span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-accent text-[0.5625rem] text-accent-foreground">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-border bg-background">
          <form
            onSubmit={submitSearch}
            className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4"
          >
            <Search className="size-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search kurtis, kurtas, sets…"
              aria-label="Search products"
              className="border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
            />
            <button
              type="submit"
              className="text-xs uppercase tracking-[0.16em] text-accent"
            >
              Search
            </button>
          </form>
        </div>
      ) : null}
    </header>
  );
}
