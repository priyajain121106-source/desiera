/**
 * Desi Era sample catalog.
 * ------------------------------------------------------------------
 * Replace the `products` array with real catalog data. Keep the shape
 * intact and the storefront (grids, filters, PDP, cart) keeps working.
 * Images: drop new files in src/assets and import them below.
 *
 * Rule of thumb: one product = one garment = its own photograph.
 */

import catKurtis from "@/assets/cat-kurtis.jpg";
import catKurtas from "@/assets/cat-kurtas.jpg";
import catKurtaSets from "@/assets/cat-kurta-sets.jpg";
import catCoords from "@/assets/cat-coord-sets.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import kurta1 from "@/assets/kurta-1.jpg";
import kurta2 from "@/assets/kurta-2.jpg";
import kurta3 from "@/assets/kurta-3.jpg";
import coord1 from "@/assets/coord-1.jpg";
import coord2 from "@/assets/coord-2.jpg";
import set2 from "@/assets/set-2.jpg";
import heroMain from "@/assets/hero-desi-era.jpg";
import editorial from "@/assets/editorial-desi-era.jpg";

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
    tagline: "Clean lines, quietly refined",
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
    tagline: "Modern western two-pieces",
    image: catCoords,
  },
];

export const categoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);

const SIZES_STD = ["XS", "S", "M", "L", "XL", "XXL"];

export const allSizes = SIZES_STD;

const CARE = [
  "Fabric: add composition before launch",
  "Care: add wash instructions",
  "Country of origin: India",
];

export const products: Product[] = [
  /* ---------------------------------------------------------- Kurtis */
  {
    id: "de-001",
    slug: "sahar-block-print-kurti",
    name: "Sahar Block-Print Kurti",
    category: "kurtis",
    price: 2190,
    compareAtPrice: 2790,
    colorName: "Terracotta",
    colorGroup: "Rust",
    colorHex: "#b7623f",
    sizes: SIZES_STD,
    images: [product1],
    inStock: true,
    isNew: true,
    isBestSeller: true,
    description:
      "A straight-cut kurti with a soft fall and a fine printed border. Made to move between work mornings and slow evenings.",
    details: [
      "Straight fit with side slits",
      "Mandarin collar, placket opening",
      "Three-quarter sleeves",
    ],
    fabricAndCare: CARE,
    stylingNote:
      "Pair with slim ivory pants and flat mules for daytime, or layer a dupatta for evenings.",
  },
  {
    id: "de-002",
    slug: "gulab-everyday-kurti",
    name: "Gulab Everyday Kurti",
    category: "kurtis",
    price: 1790,
    colorName: "Blush",
    colorGroup: "Pink",
    colorHex: "#efa9a2",
    sizes: SIZES_STD,
    images: [catKurtis],
    inStock: true,
    description:
      "A clean blush kurti with a mandarin collar and wooden buttons. The one you reach for without thinking.",
    details: ["Straight fit", "Mandarin collar with button placket", "Side slits"],
    fabricAndCare: CARE,
    stylingNote: "Crisp white pants keep it sharp; add a thin belt to define the waist.",
  },
  {
    id: "de-003",
    slug: "dhoop-printed-kurti",
    name: "Dhoop Printed Kurti",
    category: "kurtis",
    price: 2390,
    compareAtPrice: 2990,
    colorName: "Ivory",
    colorGroup: "Ivory",
    colorHex: "#f2ece1",
    sizes: SIZES_STD,
    images: [heroMain],
    inStock: true,
    isNew: true,
    description:
      "An ivory kurti with a fine printed motif and a contrast hem band. Light, bright, everyday.",
    details: ["A-line fit", "Contrast hem band", "Three-quarter sleeves"],
    fabricAndCare: CARE,
    stylingNote: "Rust palazzos pick up the hem detail beautifully.",
  },
  {
    id: "de-004",
    slug: "aira-rose-kurti",
    name: "Aira Rose Kurti",
    category: "kurtis",
    price: 2090,
    colorName: "Dusty Rose",
    colorGroup: "Pink",
    colorHex: "#d98c8c",
    sizes: SIZES_STD,
    images: [product4],
    inStock: true,
    description:
      "A tonal rose kurti with a soft round neck and a gently tapered line. Understated, endlessly wearable.",
    details: ["Semi-fitted silhouette", "Round neck with keyhole", "Side slits"],
    fabricAndCare: CARE,
    stylingNote: "Roll the sleeves and add tan sandals for a lighter look.",
  },

  /* ---------------------------------------------------------- Kurtas */
  {
    id: "de-005",
    slug: "sufi-ivory-chikan-kurta",
    name: "Sufi Ivory Kurta",
    category: "kurtas",
    price: 3690,
    colorName: "Ivory",
    colorGroup: "Ivory",
    colorHex: "#f1e9dc",
    sizes: SIZES_STD,
    images: [kurta1],
    inStock: true,
    isNew: true,
    isBestSeller: true,
    description:
      "A clean ivory kurta with tonal thread work at the yoke, cut to a modern knee-skimming length. Light, breathable, quietly festive.",
    details: ["Modern straight fit", "Tonal work at the yoke", "Concealed side pockets"],
    fabricAndCare: CARE,
    stylingNote: "Wear with narrow ivory pants and flat sandals; one gold hoop is enough.",
  },
  {
    id: "de-006",
    slug: "mitti-rust-kurta",
    name: "Mitti Rust Kurta",
    category: "kurtas",
    price: 3190,
    compareAtPrice: 3690,
    colorName: "Rust",
    colorGroup: "Rust",
    colorHex: "#b06152",
    sizes: SIZES_STD,
    images: [kurta2],
    inStock: true,
    isBestSeller: true,
    description:
      "A rust kurta with a fine pintuck placket and three-quarter sleeves. Structured through the shoulder, fluid below.",
    details: ["Straight fit, knee length", "Pintuck placket detail", "Deep side slits"],
    fabricAndCare: CARE,
    stylingNote: "Slim matching pants keep the line clean; switch to denim for weekends.",
  },
  {
    id: "de-007",
    slug: "mira-sand-kurta",
    name: "Mira Sand Kurta",
    category: "kurtas",
    price: 2890,
    colorName: "Sand",
    colorGroup: "Ivory",
    colorHex: "#d9c3a2",
    sizes: SIZES_STD,
    images: [kurta3],
    inStock: true,
    isNew: true,
    description:
      "A warm sand kurta with a mandarin collar and tonal placket work. The quietest piece in the wardrobe, and the most used.",
    details: ["A-line fit", "Mandarin collar", "Tonal placket embroidery"],
    fabricAndCare: CARE,
    stylingNote: "Keep it tonal — sand pants and gold juttis finish it.",
  },
  {
    id: "de-008",
    slug: "noor-sage-kurta",
    name: "Noor Sage Kurta",
    category: "kurtas",
    price: 3290,
    colorName: "Sage",
    colorGroup: "Green",
    colorHex: "#94a97e",
    sizes: SIZES_STD,
    images: [editorial],
    inStock: true,
    description:
      "A sage kurta with tonal thread work along the placket. Fluid, unfussy and easy to dress up.",
    details: ["Relaxed straight fit", "Tonal embroidery at neckline", "Side slits"],
    fabricAndCare: CARE,
    stylingNote: "Wear with matching narrow pants and gold studs.",
  },
  {
    id: "de-009",
    slug: "neel-midnight-kurta",
    name: "Neel Midnight Kurta",
    category: "kurtas",
    price: 3490,
    compareAtPrice: 3990,
    colorName: "Midnight",
    colorGroup: "Blue",
    colorHex: "#22314f",
    sizes: SIZES_STD,
    images: [catKurtas],
    inStock: true,
    isBestSeller: true,
    description:
      "A deep midnight kurta with a delicate worked yoke. Quiet, elongating, easy.",
    details: ["Straight column silhouette", "Worked yoke", "Deep side slits"],
    fabricAndCare: CARE,
    stylingNote: "Let it stand alone. Flat sandals, hair tied back.",
  },
  {
    id: "de-010",
    slug: "saanjh-olive-kurta",
    name: "Saanjh Olive Kurta",
    category: "kurtas",
    price: 3890,
    colorName: "Olive",
    colorGroup: "Green",
    colorHex: "#7c8760",
    sizes: SIZES_STD,
    images: [product2],
    inStock: false,
    description:
      "A softly draped olive kurta cut for movement and quiet evenings.",
    details: ["Relaxed drape", "Rolled sleeve tabs", "Concealed side pockets"],
    fabricAndCare: CARE,
    stylingNote: "Add a fine stole in a lighter tone.",
  },

  /* ------------------------------------------------------ Kurta Sets */
  {
    id: "de-011",
    slug: "raat-kurta-set",
    name: "Raat Kurta Set",
    category: "kurta-sets",
    price: 4890,
    compareAtPrice: 5990,
    colorName: "Ink",
    colorGroup: "Black",
    colorHex: "#1c1f2b",
    sizes: SIZES_STD,
    images: [product3],
    inStock: true,
    isBestSeller: true,
    description:
      "A three-piece set in deep ink with fine gold-toned detailing. Considered enough for celebrations, simple enough to repeat.",
    details: ["Kurta, pants and dupatta", "Fine metallic thread detail", "Straight-fit pants"],
    fabricAndCare: CARE,
    stylingNote: "Keep jewellery minimal — one statement earring is enough.",
  },
  {
    id: "de-012",
    slug: "amber-kurta-set",
    name: "Amber Kurta Set",
    category: "kurta-sets",
    price: 4590,
    colorName: "Marigold",
    colorGroup: "Yellow",
    colorHex: "#e9a725",
    sizes: SIZES_STD,
    images: [catKurtaSets],
    inStock: true,
    isNew: true,
    description:
      "A warm marigold set with a bordered dupatta — made for daytime celebrations.",
    details: ["Kurta, pants and dupatta", "Contrast bordered dupatta", "Straight-fit pants"],
    fabricAndCare: CARE,
    stylingNote: "Balance the colour with neutral footwear and simple gold.",
  },
  {
    id: "de-013",
    slug: "meher-kurta-set",
    name: "Meher Rose Kurta Set",
    category: "kurta-sets",
    price: 5290,
    compareAtPrice: 6290,
    colorName: "Rose",
    colorGroup: "Pink",
    colorHex: "#dd9a95",
    sizes: SIZES_STD,
    images: [set2],
    inStock: true,
    isNew: true,
    isBestSeller: true,
    description:
      "A soft rose set with fine tonal work and a sheer dupatta — an easy answer to a long day of occasions.",
    details: ["Kurta, pants and dupatta", "Tonal zari placket work", "Straight-fit pants"],
    fabricAndCare: CARE,
    stylingNote: "Sheer dupatta draped long keeps the line uninterrupted.",
  },

  /* ----------------------------------------- Co-ord Sets (western) */
  {
    id: "de-014",
    slug: "roz-ivory-coord-set",
    name: "Roz Ivory Shirt Co-ord",
    category: "co-ord-sets",
    price: 4290,
    colorName: "Ivory",
    colorGroup: "Ivory",
    colorHex: "#efe9df",
    sizes: SIZES_STD,
    images: [catCoords],
    inStock: true,
    isNew: true,
    isBestSeller: true,
    description:
      "A relaxed ivory shirt with tailored straight trousers. Western, minimal and cut to be worn together or apart.",
    details: ["Relaxed collared shirt", "Pleated straight trousers", "Side pockets"],
    fabricAndCare: CARE,
    stylingNote: "Wear as a set with heeled mules, or split the shirt over denim.",
  },
  {
    id: "de-015",
    slug: "vann-tailored-coord-set",
    name: "Vann Tailored Co-ord",
    category: "co-ord-sets",
    price: 4690,
    compareAtPrice: 5290,
    colorName: "Stone Grey",
    colorGroup: "Grey",
    colorHex: "#8a8578",
    sizes: SIZES_STD,
    images: [coord1],
    inStock: true,
    isNew: true,
    description:
      "A cropped boxy blazer-shirt with wide-leg tailored trousers. Sharp shoulders, easy line.",
    details: ["Cropped notch-collar shirt jacket", "Wide-leg pleated trousers", "Fully lined waistband"],
    fabricAndCare: CARE,
    stylingNote: "Square-toe slides by day, black heels after six.",
  },
  {
    id: "de-016",
    slug: "reth-linen-coord-set",
    name: "Reth Linen Co-ord",
    category: "co-ord-sets",
    price: 3890,
    colorName: "Chocolate",
    colorGroup: "Brown",
    colorHex: "#5c4033",
    sizes: SIZES_STD,
    images: [coord2],
    inStock: true,
    isBestSeller: true,
    description:
      "A short-sleeve linen shirt with pleated tailored shorts in warm chocolate. Weekend dressing, done properly.",
    details: ["Camp-collar linen shirt", "Pleated tailored shorts", "Slant pockets"],
    fabricAndCare: CARE,
    stylingNote: "Tuck the shirt and add leather sandals.",
  },
];

export const productBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const productsByCategory = (slug: CategorySlug) =>
  products.filter((p) => p.category === slug);

export const newArrivals = products.filter((p) => p.isNew);
export const bestSellers = products.filter((p) => p.isBestSeller);

export const colorGroups = Array.from(
  new Set(products.map((p) => p.colorGroup)),
).sort();

export const formatINR = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export const heroImage = heroMain;
export const editorialImage = editorial;
