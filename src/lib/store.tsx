import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products, type Product } from "@/data/products";

export type CartLine = {
  productId: string;
  size: string;
  qty: number;
  savedForLater?: boolean;
};

type StoreState = {
  cart: CartLine[];
  wishlist: string[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (productId: string, size: string, qty?: number) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  removeLine: (productId: string, size: string) => void;
  toggleSaveForLater: (productId: string, size: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  cartCount: number;
  subtotal: number;
  activeLines: (CartLine & { product: Product })[];
  savedLines: (CartLine & { product: Product })[];
};

const StoreContext = createContext<StoreState | null>(null);

const CART_KEY = "hok.cart.v1";
const WISH_KEY = "hok.wishlist.v1";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(read<CartLine[]>(CART_KEY, []));
    setWishlist(read<string[]>(WISH_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = useCallback((productId: string, size: string, qty = 1) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (l) => l.productId === productId && l.size === size && !l.savedForLater,
      );
      const existing = idx >= 0 ? prev[idx] : undefined;
      if (existing) {
        const next = [...prev];
        next[idx] = { ...existing, qty: existing.qty + qty };
        return next;
      }

      return [...prev, { productId, size, qty }];
    });
  }, []);

  const updateQty = useCallback((productId: string, size: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.productId === productId && l.size === size))
        : prev.map((l) =>
            l.productId === productId && l.size === size ? { ...l, qty } : l,
          ),
    );
  }, []);

  const removeLine = useCallback((productId: string, size: string) => {
    setCart((prev) =>
      prev.filter((l) => !(l.productId === productId && l.size === size)),
    );
  }, []);

  const toggleSaveForLater = useCallback((productId: string, size: string) => {
    setCart((prev) =>
      prev.map((l) =>
        l.productId === productId && l.size === size
          ? { ...l, savedForLater: !l.savedForLater }
          : l,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const withProduct = (lines: CartLine[]) =>
    lines
      .map((l) => {
        const product = products.find((p) => p.id === l.productId);
        return product ? { ...l, product } : null;
      })
      .filter(Boolean) as (CartLine & { product: Product })[];

  const activeLines = useMemo(
    () => withProduct(cart.filter((l) => !l.savedForLater)),
    [cart],
  );
  const savedLines = useMemo(
    () => withProduct(cart.filter((l) => l.savedForLater)),
    [cart],
  );

  const value: StoreState = {
    cart,
    wishlist,
    cartOpen,
    setCartOpen,
    addToCart,
    updateQty,
    removeLine,
    toggleSaveForLater,
    clearCart,
    toggleWishlist,
    isWishlisted: (id) => wishlist.includes(id),
    cartCount: activeLines.reduce((s, l) => s + l.qty, 0),
    subtotal: activeLines.reduce((s, l) => s + l.qty * l.product.price, 0),
    activeLines,
    savedLines,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
