/**
 * HOK sample catalog.
 * ------------------------------------------------------------------
 * Replace the `products` array with real catalog data. Keep the shape
 * intact and the storefront (grids, filters, PDP, cart) keeps working.
 * Images: drop new files in src/assets and import them below.
 */

import catKurtis from "@/assets/cat-kurtis.jpg";
import catKurtas from "@/assets/cat-kurtas.jpg";
import catKurtaSets from "@/assets/cat-kurta-sets.jpg";
import catCoords from "@/assets/cat-coord-sets.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import heroMain from "@/assets/hero-main.jpg";
import editorial from "@/assets/editorial-everyday.jpg";

export type CategorySlug = "kurtis" | "kurtas" | "kurta-sets" | "co-ord-sets";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  compareAtPrice?: number;
  colorName: string;
  colorGroup: string;
  colorHex: string;
  sizes: string[];
  images: string[];
  inStock: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  /** Short editorial description — edit freely. */
  description: string;
  /** Placeholder spec rows. Replace with your real product data. */
  details: string[];
  /** Placeholder — add verified fabric & care info before launch. */
  fabricAndCare: string[];
  stylingNote: string;
};

export const categories: {
  slug: CategorySlug;
  name: string;
  tagline: string;
  image: string;
}[] = [
  {
    slug: "kurtis",
    name: "Kurtis",
    tagline: "Easy silhouettes for every day",
    image: catKurtis,
  },
  {
    slug: "kurtas",
    name: "Kurtas",
    tagline: "Long, fluid and quietly refined",
    image: catKurtas,
  },
  {
    slug: "kurta-sets",
    name: "Kurta Sets",
    tagline: "Coordinated, ready to wear",
    image: catKurtaSets,
  },
  {
    slug: "co-ord-sets",
    name: "Co-ord Sets",
    tagline: "Two pieces, one effortless look",
    image: catCoords,
  },
];

export const categoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);

const SIZES_STD = ["XS", "S", "M", "L", "XL", "XXL"];

export const allSizes = SIZES_STD;

export const products: Product[] = [
  {
    id: "hok-001",
    slug: "sahar-block-print-kurti",
    name: "Sahar Block-Print Kurti",
    category: "kurtis",
    price: 2190,
    compareAtPrice: 2790,
    colorName: "Terracotta",
    colorGroup: "Rust",
    colorHex: "#b7623f",
    sizes: SIZES_STD,
    images: [product1, catKurtis, heroMain],
    inStock: true,
    isNew: true,
    isBestSeller: true,
    description:
      "A straight-cut kurti with a soft fall and a fine printed border. Made to move between work mornings and slow evenings.",
    details: [
      "Straight fit with side slits",
      "Mandarin collar, placket opening",
      "Three-quarter sleeves",
      "Model reference height: placeholder",
    ],
    fabricAndCare: [
      "Fabric: add composition before launch",
      "Care: add wash instructions",
      "Country of origin: India",
    ],
    stylingNote:
      "Pair with slim ivory pants and flat mules for daytime, or layer a dupatta for evenings.",
  },
  {
    id: "hok-002",
    slug: "noor-sage-kurta",
    name: "Noor Embroidered Kurta",
    category: "kurtas",
    price: 3290,
    colorName: "Sage",
    colorGroup: "Green",
    colorHex: "#94a97e",
    sizes: SIZES_STD,
    images: [product2, editorial],
    inStock: true,
    isNew: true,
    description:
      "A long kurta with tonal thread work along the placket. Fluid, unfussy and easy to dress up.",
    details: [
      "Relaxed straight fit",
      "Tonal embroidery at neckline and hem",
      "Full-length with side slits",
    ],
    fabricAndCare: [
      "Fabric: add composition before launch",
      "Care: add wash instructions",
      "Country of origin: India",
    ],
    stylingNote: "Wear with matching narrow pants and gold studs.",
  },
  {
    id: "hok-003",
    slug: "raat-kurta-set",
    name: "Raat Kurta Set",
    category: "kurta-sets",
    price: 4890,
    compareAtPrice: 5990,
    colorName: "Ink",
    colorGroup: "Black",
    colorHex: "#1c1f2b",
    sizes: SIZES_STD,
    images: [product3, catKurtaSets],
    inStock: true,
    isBestSeller: true,
    description:
      "A three-piece set in deep ink with fine gold-toned detailing. Considered enough for celebrations, simple enough to repeat.",
    details: ["Kurta, pants and dupatta", "Fine metallic thread detail", "Straight-fit pants"],
    fabricAndCare: [
      "Fabric: add composition before launch",
      "Care: add wash instructions",
      "Country of origin: India",
    ],
    stylingNote: "Keep jewellery minimal — one statement earring is enough.",
  },
  {
    id: "hok-004",
    slug: "mira-rose-coord-set",
    name: "Mira Rose Co-ord Set",
    category: "co-ord-sets",
    price: 3990,
    colorName: "Dusty Rose",
    colorGroup: "Pink",
    colorHex: "#d98c8c",
    sizes: SIZES_STD,
    images: [product4, catCoords],
    inStock: true,
    isNew: true,
    isBestSeller: true,
    description:
      "A tonal co-ord in soft rose — short kurta above tapered pants, cut for an easy line.",
    details: ["Two-piece co-ord", "Tapered pants", "Subtle placket detail"],
    fabricAndCare: [
      "Fabric: add composition before launch",
      "Care: add wash instructions",
      "Country of origin: India",
    ],
    stylingNote: "Roll the sleeves and add tan sandals for a lighter look.",
  },
  {
    id: "hok-005",
    slug: "aira-stripe-coord-set",
    name: "Aira Stripe Co-ord Set",
    category: "co-ord-sets",
    price: 4290,
    compareAtPrice: 4990,
    colorName: "Ivory Stripe",
    colorGroup: "Ivory",
    colorHex: "#efe9df",
    sizes: SIZES_STD,
    images: [catCoords, product4],
    inStock: true,
    isBestSeller: true,
    description:
      "A relaxed shirt and wide-leg trousers in a fine stripe. Structured, breathable, endlessly wearable.",
    details: ["Relaxed shirt with collar", "Wide-leg trousers", "Side pockets"],
    fabricAndCare: [
      "Fabric: add composition before launch",
      "Care: add wash instructions",
      "Country of origin: India",
    ],
    stylingNote: "Wear as a set, or split the shirt over denim.",
  },
  {
    id: "hok-006",
    slug: "gulab-everyday-kurti",
    name: "Gulab Everyday Kurti",
    category: "kurtis",
    price: 1790,
    colorName: "Blush",
    colorGroup: "Pink",
    colorHex: "#efa9a2",
    sizes: SIZES_STD,
    images: [catKurtis, product4],
    inStock: true,
    description:
      "A clean blush kurti with a mandarin collar and wooden buttons. The one you reach for without thinking.",
    details: ["Straight fit", "Mandarin collar with button placket", "Side slits"],
    fabricAndCare: [
      "Fabric: add composition before launch",
      "Care: add wash instructions",
      "Country of origin: India",
    ],
    stylingNote: "Crisp white pants keep it sharp; add a thin belt to define the waist.",
  },
  {
    id: "hok-007",
    slug: "neel-long-kurta",
    name: "Neel Long Kurta",
    category: "kurtas",
    price: 3490,
    compareAtPrice: 3990,
    colorName: "Midnight",
    colorGroup: "Blue",
    colorHex: "#22314f",
    sizes: SIZES_STD,
    images: [catKurtas, product2],
    inStock: true,
    isBestSeller: true,
    description:
      "A floor-skimming kurta in deep midnight with a delicate worked yoke. Quiet, elongating, easy.",
    details: ["Full-length column silhouette", "Worked yoke", "Deep side slits"],
    fabricAndCare: [
      "Fabric: add composition before launch",
      "Care: add wash instructions",
      "Country of origin: India",
    ],
    stylingNote: "Let it stand alone. Flat sandals, hair tied back.",
  },
  {
    id: "hok-008",
    slug: "amber-kurta-set",
    name: "Amber Kurta Set",
    category: "kurta-sets",
    price: 4590,
    colorName: "Marigold",
    colorGroup: "Yellow",
    colorHex: "#e9a725",
    sizes: SIZES_STD,
    images: [catKurtaSets, product3],
    inStock: true,
    isNew: true,
    description:
      "A warm marigold set with a bordered dupatta — made for daytime celebrations.",
    details: ["Kurta, pants and dupatta", "Contrast bordered dupatta", "Straight-fit pants"],
    fabricAndCare: [
      "Fabric: add composition before launch",
      "Care: add wash instructions",
      "Country of origin: India",
    ],
    stylingNote: "Balance the colour with neutral footwear and simple gold.",
  },
  {
    id: "hok-009",
    slug: "saanjh-kurta",
    name: "Saanjh Draped Kurta",
    category: "kurtas",
    price: 3890,
    colorName: "Olive",
    colorGroup: "Green",
    colorHex: "#7c8760",
    sizes: SIZES_STD,
    images: [editorial, product2],
    inStock: false,
    description:
      "A softly draped kurta with a matching stole. Cut for movement and quiet evenings.",
    details: ["Relaxed drape", "Includes stole", "Concealed side pockets"],
    fabricAndCare: [
      "Fabric: add composition before launch",
      "Care: add wash instructions",
      "Country of origin: India",
    ],
    stylingNote: "Keep the stole loose over one shoulder.",
  },
  {
    id: "hok-010",
    slug: "dhoop-printed-kurti",
    name: "Dhoop Printed Kurti",
    category: "kurtis",
    price: 2390,
    compareAtPrice: 2990,
    colorName: "Ivory",
    colorGroup: "Ivory",
    colorHex: "#f2ece1",
    sizes: SIZES_STD,
    images: [heroMain, product1],
    inStock: true,
    isNew: true,
    description:
      "An ivory kurti with a fine printed motif and a contrast hem band. Light, bright, everyday.",
    details: ["A-line fit", "Contrast hem band", "Three-quarter sleeves"],
    fabricAndCare: [
      "Fabric: add composition before launch",
      "Care: add wash instructions",
      "Country of origin: India",
    ],
    stylingNote: "Rust palazzos pick up the hem detail beautifully.",
  },
  {
    id: "hok-011",
    slug: "roz-coord-set",
    name: "Roz Everyday Co-ord",
    category: "co-ord-sets",
    price: 3690,
    colorName: "Sand",
    colorGroup: "Ivory",
    colorHex: "#e3d7c5",
    sizes: SIZES_STD,
    images: [product4, catCoords],
    inStock: true,
    description:
      "A pared-back co-ord in warm sand. Nothing extra, nothing missing.",
    details: ["Two-piece co-ord", "Straight pants", "Minimal seam detail"],
    fabricAndCare: [
      "Fabric: add composition before launch",
      "Care: add wash instructions",
      "Country of origin: India",
    ],
    stylingNote: "Tonal dressing at its easiest — match your footwear to the set.",
  },
  {
    id: "hok-012",
    slug: "meher-kurta-set",
    name: "Meher Kurta Set",
    category: "kurta-sets",
    price: 5290,
    compareAtPrice: 6290,
    colorName: "Rose",
    colorGroup: "Pink",
    colorHex: "#dd9a95",
    sizes: SIZES_STD,
    images: [product4, catKurtaSets],
    inStock: true,
    description:
      "A soft rose set with fine tonal work — an easy answer to a long day of occasions.",
    details: ["Kurta, pants and dupatta", "Tonal placket work", "Straight-fit pants"],
    fabricAndCare: [
      "Fabric: add composition before launch",
      "Care: add wash instructions",
      "Country of origin: India",
    ],
    stylingNote: "Sheer dupatta draped long keeps the line uninterrupted.",
  },
];

export const productBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const productsByCategory = (slug: CategorySlug) =>
  products.filter((p) => p.category === slug);

export const newArrivals = products.filter((p) => p.isNew);
export const bestSellers = products.filter((p) => p.isBestSeller);

export const colorGroups = Array.from(
  new Map(products.map((p) => [p.colorGroup, p.colorHex])).entries(),
).map(([name, hex]) => ({ name, hex }));

export const formatINR = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export const heroImage = heroMain;
export const editorialImage = editorial;
export { catKurtis, catKurtas, catKurtaSets, catCoords };
