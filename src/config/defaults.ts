/**
 * Fallback data used ONLY when the database is not reachable yet
 * (e.g. before Supabase keys are added). Once Supabase is connected, the
 * database is the source of truth and these values are ignored.
 * Keep them in sync with supabase/seed.sql.
 */
import type { Panel, SizeRow, StoreSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: StoreSettings = {
  jacket_price: 5000,
  jacket_compare_at: null,
  pack_price: 1000,
  pack_size: 3,
  bundle_discount: 0,
  custom_panel_fee: 0,
  delivery_inside_dhaka: 80,
  delivery_outside_dhaka: 150,
  free_delivery_min: null,
  announcement: "Cash on delivery all over Bangladesh",
  orders_enabled: true,
  support_phone: null,
  support_email: null,
  whatsapp: null,
  facebook_url: null,
  instagram_url: null,
  size_chart: [
    { size: "XS", chest: "21", length: "24.5", sleeve: "23", fit: "Cropped & close" },
    { size: "S", chest: "22", length: "25", sleeve: "23.5", fit: "Relaxed" },
    { size: "M", chest: "23", length: "25.5", sleeve: "24", fit: "Relaxed, boxy" },
    { size: "L", chest: "24", length: "26", sleeve: "24.5", fit: "Boxy" },
    { size: "XL", chest: "25", length: "26.5", sleeve: "25", fit: "Roomy layering" },
    { size: "XXL", chest: "26", length: "27", sleeve: "25.5", fit: "Extra roomy" },
  ],
};

export const DEFAULT_SIZES: SizeRow[] = [
  { size: "XS", sort_order: 1, stock: 10, is_active: true },
  { size: "S", sort_order: 2, stock: 20, is_active: true },
  { size: "M", sort_order: 3, stock: 25, is_active: true },
  { size: "L", sort_order: 4, stock: 25, is_active: true },
  { size: "XL", sort_order: 5, stock: 20, is_active: true },
  { size: "XXL", sort_order: 6, stock: 10, is_active: true },
];

export const CATEGORIES = [
  "Night & Moon",
  "Floral",
  "Campus Pride",
  "Retro & Pop",
  "Art & Grunge",
  "Nature & Cosmos",
] as const;

type Seed = Omit<
  Panel,
  "id" | "artist" | "image_url" | "image_public_id" | "stock" | "is_active" | "created_at"
>;

const seed: Seed[] = [
  { slug: "have-we-been-cursed", name: "Have We Been Cursed?", category: "Night & Moon", badge: "NEW", is_featured: true, sort_order: 1, description: "A black cat and a crow share a branch under a sour yellow moon. Painterly, moody, a little bit ominous." },
  { slug: "sakura-moon", name: "Sakura Moon", category: "Night & Moon", badge: "TRENDING", is_featured: true, sort_order: 2, description: "Cherry blossoms spill across a harvest moon above old clay rooftops. Textured, warm and quietly loud." },
  { slug: "lighthouse-lullaby", name: "Lighthouse Lullaby", category: "Night & Moon", badge: null, is_featured: false, sort_order: 3, description: "A lighthouse keeps watch under a sky full of stars, framed in a folk-art border." },
  { slug: "solitude", name: "Solitude", category: "Art & Grunge", badge: "TRENDING", is_featured: true, sort_order: 4, description: "Editorial collage: a stippled skull growing flowers. In solitude we meet ourselves." },
  { slug: "creation-in-bloom", name: "Creation in Bloom", category: "Art & Grunge", badge: null, is_featured: false, sort_order: 5, description: "Two reaching hands meet over a field of almond blossom. Two classics, one panel." },
  { slug: "curzon-hall", name: "Curzon Hall", category: "Campus Pride", badge: "NEW", is_featured: true, sort_order: 6, description: "Dhaka's red-brick landmark in a sun-washed retro poster style." },
  { slug: "jahangirnagar", name: "Jahangirnagar", category: "Campus Pride", badge: null, is_featured: false, sort_order: 7, description: "A loud, colourful love letter to JU — monuments, buses and Bangla type." },
  { slug: "diu-campus", name: "DIU Campus", category: "Campus Pride", badge: null, is_featured: false, sort_order: 8, description: "A green-toned architectural poster of the Daffodil campus." },
  { slug: "keep-it-classic", name: "Keep It Classic", category: "Retro & Pop", badge: null, is_featured: true, sort_order: 9, description: "A hand drops the needle on a worn vinyl. Distressed, red and timeless." },
  { slug: "city-of-stars", name: "City of Stars", category: "Retro & Pop", badge: null, is_featured: false, sort_order: 10, description: "Two dancers, one street lamp and a row of piano keys under a deep blue sky." },
  { slug: "rouge-bloom", name: "Rouge Bloom", category: "Floral", badge: null, is_featured: true, sort_order: 11, description: "Fine-line roses inside an ornate crimson frame — tattoo-flash energy." },
  { slug: "sunflower-print", name: "Sunflower Print", category: "Floral", badge: null, is_featured: false, sort_order: 12, description: "A bold linocut sunflower in yellow and cobalt, with real block-print texture." },
  { slug: "wild-roses", name: "Wild Roses", category: "Floral", badge: null, is_featured: false, sort_order: 13, description: "Deep red roses and soft leaves on raw linen. Quiet and romantic." },
  { slug: "campfire-night", name: "Campfire Night", category: "Nature & Cosmos", badge: null, is_featured: true, sort_order: 14, description: "A tent wrapped in flame under smoky clouds and a dark pine forest." },
  { slug: "orbit", name: "Orbit", category: "Nature & Cosmos", badge: "NEW", is_featured: false, sort_order: 15, description: "Hand-etched planets drifting on black. Minimal from far, detailed up close." },
];

export const SEED_PANELS: Panel[] = seed.map((p) => ({
  ...p,
  id: `seed-${p.slug}`,
  artist: "Wronge Studio",
  image_url: `/seed/panels/${p.slug}.webp`,
  image_public_id: null,
  stock: null,
  is_active: true,
}));
