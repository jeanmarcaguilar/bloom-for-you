export const PEONY_DESIGNS = [
  // ── Category 1: Double & Bomb Peonies ──
  { value: "peony_sarah_bernhardt", label: "Sarah Bernhardt", category: "Double Bomb", desc: "Classic blush double with ruffled petals", color: "#F7A8BF", designIndex: 0 },
  { value: "peony_red_charm", label: "Red Charm", category: "Double Bomb", desc: "Rich crimson bomb with spherical center", color: "#A81832", designIndex: 4 },
  { value: "peony_kansas", label: "Kansas", category: "Double Bomb", desc: "Brilliant vivid magenta full double", color: "#C82D6E", designIndex: 8 },
  { value: "peony_alexander_fleming", label: "Dr. Fleming", category: "Double Bomb", desc: "Sweetly scented frilled rose-pink", color: "#F28CB1", designIndex: 12 },
  { value: "peony_monsieur_jules_elie", label: "Jules Elie", category: "Double Bomb", desc: "Silvery-pink high domed bomb", color: "#F4A3C2", designIndex: 16 },
  { value: "peony_pillow_talk", label: "Pillow Talk", category: "Double Bomb", desc: "Lush cloud of soft baby-pink petals", color: "#F9CFDC", designIndex: 20 },
  { value: "peony_dinner_plate", label: "Dinner Plate", category: "Double Bomb", desc: "Giant layered shell-pink blooms", color: "#F39AB7", designIndex: 24 },
  { value: "peony_madame_calot", label: "Madame Calot", category: "Double Bomb", desc: "Antique cream with soft blush center", color: "#FBE6ED", designIndex: 28 },

  // ── Category 2: Imperial & Japanese Peonies ──
  { value: "peony_bowl_of_beauty", label: "Bowl of Beauty", category: "Imperial Core", desc: "Carmine cup with creamy golden staminodes", color: "#EB5E8C", designIndex: 1 },
  { value: "peony_do_tell", label: "Do Tell", category: "Imperial Core", desc: "Soft orchid-pink with multicolored center", color: "#EDA0BD", designIndex: 5 },
  { value: "peony_sword_dance", label: "Sword Dance", category: "Imperial Core", desc: "Deep ruby guard petals with golden crest", color: "#9B1A30", designIndex: 9 },
  { value: "peony_white_cap", label: "White Cap", category: "Imperial Core", desc: "Burgundy bowl with frosted ivory petaloids", color: "#871426", designIndex: 13 },
  { value: "peony_walter_mains", label: "Walter Mains", category: "Imperial Core", desc: "Dark chocolate-garnet with golden staminodes", color: "#6C1622", designIndex: 17 },
  { value: "peony_bu_te", label: "Bu-Te", category: "Imperial Core", desc: "Large pure ivory saucer with golden sunburst", color: "#FFFDF6", designIndex: 21 },
  { value: "peony_doreen", label: "Doreen", category: "Imperial Core", desc: "Bright fuchsia saucer with apricot center", color: "#DB3475", designIndex: 25 },
  { value: "peony_gay_paree", label: "Gay Paree", category: "Imperial Core", desc: "Deep cerise guard petals with cream pompom", color: "#C92864", designIndex: 29 },

  // ── Category 3: Semi-Double Peonies ──
  { value: "peony_coral_sunset", label: "Coral Sunset", category: "Semi-Double", desc: "Glowing sunset coral fading to champagne", color: "#F7786B", designIndex: 2 },
  { value: "peony_coral_charm", label: "Coral Charm", category: "Semi-Double", desc: "Exotic peach-coral with golden anther ring", color: "#F48B77", designIndex: 6 },
  { value: "peony_paula_fay", label: "Paula Fay", category: "Semi-Double", desc: "Radiant glistening vibrant rose-pink", color: "#E84478", designIndex: 10 },
  { value: "peony_miss_america", label: "Miss America", category: "Semi-Double", desc: "Snowy white chalice with golden stamens", color: "#FFFFFF", designIndex: 14 },
  { value: "peony_buckeye_belle", label: "Buckeye Belle", category: "Semi-Double", desc: "Dramatic velvety maroon with gold flecks", color: "#54121A", designIndex: 18 },
  { value: "peony_cytherea", label: "Cytherea", category: "Semi-Double", desc: "Satin lotus-cupped cherry-coral", color: "#EB4E63", designIndex: 22 },
  { value: "peony_pink_hawaiian", label: "Pink Hawaiian", category: "Semi-Double", desc: "Tropical coral-apricot with yellow core", color: "#FA8572", designIndex: 26 },
  { value: "peony_scarlet_ohara", label: "Scarlet O'Hara", category: "Semi-Double", desc: "Fiery scarlet with contrasting stamens", color: "#BD1C27", designIndex: 30 },

  // ── Category 4: Rose-Form & Spiral Peonies ──
  { value: "peony_duchesse_de_nemours", label: "Duchesse", category: "Rose-Form", desc: "Fragrant white stepped crown with amber glow", color: "#FAF6EE", designIndex: 3 },
  { value: "peony_festiva_maxima", label: "Festiva Maxima", category: "Rose-Form", desc: "Pure white rose-form with crimson flecks", color: "#FCFBF7", designIndex: 7 },
  { value: "peony_shirley_temple", label: "Shirley Temple", category: "Rose-Form", desc: "Delicate blush unfurling into ivory swirl", color: "#FDECEF", designIndex: 11 },
  { value: "peony_karl_rosenfield", label: "Karl Rosenfield", category: "Rose-Form", desc: "Deep regal crimson with swirling petals", color: "#93172E", designIndex: 15 },
  { value: "peony_elsa_sass", label: "Elsa Sass", category: "Rose-Form", desc: "Velvety camellia-like pure white bloom", color: "#FFFFFF", designIndex: 19 },
  { value: "peony_moon_river", label: "Moon River", category: "Rose-Form", desc: "Creamy warm amber and blush spiraling whorl", color: "#F7E6D7", designIndex: 23 },
  { value: "peony_bartzella", label: "Bartzella Itoh", category: "Rose-Form", desc: "Luminous lemon yellow with scarlet flares", color: "#F5D040", designIndex: 27 },
  { value: "peony_grand_mix", label: "Grand Peony Mix", category: "Rose-Form", desc: "Bouquet showcasing all 30+ peony designs", color: "#F48CA5", designIndex: 31 },
] as const;

export const BOUQUET_TYPES = PEONY_DESIGNS;

export const QUANTITIES = [6, 12, 18, 24] as const;
export const COLORS = ["#F48CA5", "#F7A8BF", "#F9CFDC", "#FFFFFF", "#F7786B", "#EB5E8C", "#A81832", "#54121A", "#F5D040"];
export const WRAPS = [
  { value: "classic", label: "Classic Paper", a: "#B3173E", b: "#F6C7D3" },
  { value: "korean", label: "Korean Wrap", a: "#F8CFDA", b: "#FFF1F4" },
  { value: "burlap", label: "Burlap Wrap", a: "#C8A27A", b: "#EAD7BD" },
  { value: "box", label: "Elegant Box", a: "#FFFFFF", b: "#F3D9DF" },
  { value: "premium", label: "Premium Wrap", a: "#25201F", b: "#D4AF37" },
] as const;
export const RIBBONS = [
  { value: "satin_red", label: "Satin Red", color: "#C1121F" },
  { value: "satin_pink", label: "Satin Pink", color: "#F4A6C0" },
  { value: "satin_gold", label: "Satin Gold", color: "#E0B040" },
  { value: "satin_white", label: "Satin White", color: "#FFFFFF" },
  { value: "velvet_burgundy", label: "Velvet Burgundy", color: "#6D0F2A" },
] as const;

export const typeLabel = (v: string) =>
  PEONY_DESIGNS.find((t) => t.value === v)?.label ?? (v.startsWith("peony") ? "Peony" : v);

export const ACCESSORIES = [
  { value: "none",          label: "None",           emoji: "✕",  desc: "Just the bouquet" },
  { value: "teddy_bear",    label: "Teddy Bear",     emoji: "🧸", desc: "Soft plush cuddly bear" },
  { value: "balloon",       label: "Love Balloon",   emoji: "🎈", desc: "Heart-shaped foil balloon" },
  { value: "chocolate_box", label: "Chocolates",     emoji: "🍫", desc: "Luxury assorted box" },
  { value: "candle",        label: "Scented Candle", emoji: "🕯️", desc: "Rose & vanilla candle" },
  { value: "macaron_box",   label: "Macarons",       emoji: "🌸", desc: "Pastel French macarons" },
  { value: "plush_heart",   label: "Plush Heart",    emoji: "💝", desc: "Velvet stuffed heart" },
  { value: "blue_butterflies", label: "Blue Butterflies", emoji: "🦋", desc: "Fluttering on the flowers" },
  { value: "blue_fillers",     label: "Blue Fillers",     emoji: "💙", desc: "Tiny blue filler blooms" },
] as const;

/** Accessories drawn ON the flowers (not shown beside the bouquet). */
export const ON_BOUQUET: readonly string[] = ["blue_butterflies", "blue_fillers"];

/** Turns "teddy_bear,blue_butterflies" (or an array) into a clean, de-duplicated list. */
export const parseAccessories = (v: unknown): string[] => {
  const raw = Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [];
  const ok = new Set(ACCESSORIES.map((a) => a.value as string));
  return [...new Set(raw.map((x) => String(x).trim()).filter((x) => x && x !== "none" && ok.has(x)))];
};

/** Columns every page selects for a bouquet. */
export const BOUQUET_COLUMNS =
  "id, title, flower_type, flower_items, quantity, flower_color, wrapping_style, ribbon_style, dedication";

type BouquetRow = {
  flower_type?: string | null;
  flower_items?: unknown;
  quantity?: number | null;
  flower_color?: string | null;
  wrapping_style?: string | null;
  ribbon_style?: string | null;
  dedication?: string | null;
};

/** Everything needed to draw ONE saved bouquet exactly as it was designed (own color, wrap, ribbon, accessories). */
export const bouquetView = (b: BouquetRow) => {
  const item = (Array.isArray(b.flower_items) ? b.flower_items[0] : null) as
    | { type?: string; qty?: number; color?: string; accessory?: string }
    | null;
  const hex = (v: unknown) => (typeof v === "string" && /^#[0-9A-Fa-f]{6}$/.test(v) ? v : undefined);
  return {
    type: item?.type || b.flower_type || "peony_sarah_bernhardt",
    count: Number(item?.qty) || b.quantity || 12,
    color: hex(item?.color) ?? hex(b.flower_color) ?? "#F48CA5",
    wrap: b.wrapping_style || "classic",
    ribbon: b.ribbon_style || "satin_pink",
    accessories: parseAccessories(item?.accessory),
    tag: b.dedication || "For you",
  };
};

export type AccessoryValue = typeof ACCESSORIES[number]["value"];

export const LETTER_CATEGORIES = [
  { value: "love_note", label: "Love Note", emoji: "💌" },
  { value: "just_because", label: "Just Because", emoji: "🌸" },
  { value: "thinking_of_you", label: "Thinking of You", emoji: "💭" },
  { value: "good_morning", label: "Good Morning", emoji: "☀️" },
  { value: "good_night", label: "Good Night", emoji: "🌙" },
  { value: "gratitude", label: "Gratitude", emoji: "🙏" },
  { value: "milestone", label: "Milestone & Anniversary", emoji: "🥂" },
  { value: "apology", label: "Heartfelt Apology", emoji: "🥺" },
  { value: "custom", label: "Custom Message", emoji: "✍️" },
] as const;