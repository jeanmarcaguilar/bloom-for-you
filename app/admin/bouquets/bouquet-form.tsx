"use client";
import { useActionState, useDeferredValue, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Flower2, Palette, Gift, Heart, RotateCcw, Pencil, Check, Sparkles, Star, Mail, BookOpen, Home, ChevronRight, Calendar } from "lucide-react";
import { createBouquet, type BouquetState } from "./actions";
import { BOUQUET_TYPES, QUANTITIES, COLORS, WRAPS, RIBBONS, ACCESSORIES, LETTER_CATEGORIES, ON_BOUQUET, type AccessoryValue } from "@/lib/bouquet";
import BouquetSvg, { Bow, TeddyBearSvg, BalloonSvg, ChocolateBoxSvg, CandleSvg, MacaronBoxSvg, PlushHeartSvg, ButterflySvg, FillersSvg } from "@/components/bouquets/BouquetSvg";

const field = "mt-1 w-full rounded-xl border border-blush bg-white/90 px-4 py-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition";

const pick = (on: boolean) =>
  `group relative flex flex-col items-center justify-between rounded-2xl border p-2 text-xs transition-all duration-200 focus-visible:ring-2 focus-visible:ring-rose ${on
    ? "border-primary bg-gradient-to-b from-white to-pink-50/90 shadow-md ring-2 ring-primary/40 -translate-y-0.5"
    : "border-blush/70 bg-white/80 hover:border-primary/40 hover:bg-white hover:shadow-xs"
  }`;

function Card({ icon, title, children, headerRight }: { icon: ReactNode; title: string; children: ReactNode; headerRight?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-blush/60 bg-white/75 p-5 shadow-xs backdrop-blur-md">
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-serif text-lg font-medium text-rose">{icon}{title}</h2>
        {headerRight}
      </div>
      {children}
    </section>
  );
}

const Tick = () => (
  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-xs">
    <Check size={11} strokeWidth={3} aria-hidden />
  </span>
);

const INIT: { type: string; qty: number; color: string; wrap: string; ribbon: string } = {
  type: BOUQUET_TYPES[0].value,
  qty: 12,
  color: BOUQUET_TYPES[0].color,
  wrap: "classic",
  ribbon: "satin_pink",
};

function AccessoryPreview({ value, size }: { value: AccessoryValue; size: number }) {
  if (value === "teddy_bear") return <TeddyBearSvg size={size} />;
  if (value === "balloon") return <BalloonSvg size={size} />;
  if (value === "chocolate_box") return <ChocolateBoxSvg size={size} />;
  if (value === "candle") return <CandleSvg size={size} />;
  if (value === "macaron_box") return <MacaronBoxSvg size={size} />;
  if (value === "plush_heart") return <PlushHeartSvg size={size} />;
  if (value === "blue_butterflies") return <ButterflySvg size={size} />;
  if (value === "blue_fillers") return <FillersSvg size={size} />;
  return null;
}

/* ── Floating decorative elements ── */
function FloatingDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Floating hearts */}
      <span className="absolute left-[5%] top-[8%] text-2xl opacity-30 animate-pulse">💗</span>
      <span className="absolute right-[8%] top-[3%] text-xl opacity-25 animate-pulse" style={{ animationDelay: "0.5s" }}>💕</span>
      <span className="absolute left-[15%] top-[2%] text-lg opacity-20 animate-pulse" style={{ animationDelay: "1s" }}>♡</span>
      <span className="absolute right-[15%] top-[6%] text-sm opacity-30 animate-pulse" style={{ animationDelay: "1.5s" }}>💗</span>
      <span className="absolute right-[3%] top-[12%] text-xl opacity-20 animate-pulse" style={{ animationDelay: "0.8s" }}>♡</span>
      {/* Bottom decorative roses */}
      <span className="absolute bottom-4 left-4 text-3xl opacity-15">🌹</span>
      <span className="absolute bottom-8 right-8 text-2xl opacity-15">🌹</span>
      <span className="absolute bottom-2 left-[45%] text-xl opacity-10">🌸</span>
    </div>
  );
}

/* ── Decorative ribbon corner ── */
function RibbonCorner() {
  return (
    <div className="pointer-events-none absolute -right-2 -top-2 h-28 w-28 opacity-40" aria-hidden>
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <path d="M 80 0 Q 100 20, 120 0 Q 100 20, 120 40 Q 100 30, 90 20 Q 85 15, 80 0 Z" fill="#F4A6C0" opacity="0.6" />
        <path d="M 95 0 Q 110 15, 120 10 L 120 25 Q 105 18, 95 0 Z" fill="#D96C91" opacity="0.4" />
      </svg>
    </div>
  );
}

export default function BouquetForm() {
  const [state, action, pending] = useActionState<BouquetState, FormData>(createBouquet, {});
  const [s, setS] = useState(INIT);
  const [category, setCategory] = useState<string>("All");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [dedication, setDedication] = useState("");
  const [date, setDate] = useState("");
  const [accessories, setAccessories] = useState<string[]>([]);
  const [letterCategory, setLetterCategory] = useState<string>("love_note");
  const [letterSignature, setLetterSignature] = useState<string>("Forever yours ♡");
  const [createLetter, setCreateLetter] = useState<boolean>(true);
  const [previewTab, setPreviewTab] = useState<"bouquet" | "letter">("letter");

  const reset = () => {
    setS(INIT);
    setCategory("All");
    setTitle("");
    setMessage("");
    setDedication("");
    setDate("");
    setAccessories([]);
    setLetterCategory("love_note");
    setLetterSignature("Forever yours ♡");
    setCreateLetter(true);
    setPreviewTab("letter");
  };

  const filteredTypes = useMemo(
    () => (category === "All" ? BOUQUET_TYPES : BOUQUET_TYPES.filter((t) => (t as any).category === category)),
    [category],
  );

  const deferredDedication = useDeferredValue(dedication);
  // Butterflies / fillers are drawn on the flowers; the others sit beside the bouquet.
  const sideAccs = accessories.filter((a) => !ON_BOUQUET.includes(a));
  const toggleAccessory = (v: string) =>
    setAccessories((cur) => (v === "none" ? [] : cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));
  const currentType = BOUQUET_TYPES.find((t) => t.value === s.type) ?? BOUQUET_TYPES[0];

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  /* ── Peony Styles Card (left of top row) ── */
  const peonyCard = useMemo(
    () => (
      <Card
        icon={<Flower2 size={18} className="text-primary" aria-hidden />}
        title={`Peony Styles & Designs (${filteredTypes.length} Varieties)`}
        headerRight={
          <button type="button" className="flex items-center gap-1 text-xs font-medium text-primary transition hover:text-rose">
            View All <ChevronRight size={13} />
          </button>
        }
      >
        {/* Category Filter Tabs */}
        <div className="mb-3.5 flex flex-wrap gap-1.5 text-xs">
          {["All", "Double Bomb", "Imperial Core", "Semi-Double", "Rose-Form"].map((cat) => {
            const count = cat === "All" ? BOUQUET_TYPES.length : BOUQUET_TYPES.filter((t) => (t as any).category === cat).length;
            const isActive = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1 font-medium transition ${isActive
                    ? "bg-rose text-white shadow-xs ring-1 ring-rose"
                    : "border border-blush/60 bg-white/75 text-mute hover:border-primary/40 hover:bg-white hover:text-rose"
                  }`}
              >
                {cat} <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Grid of Peony Varieties */}
        <div className="smooth-scroll grid max-h-[320px] grid-cols-2 gap-2.5 overflow-y-auto pr-1.5 sm:grid-cols-4">
          {filteredTypes.map((t) => {
            const isSelected = s.type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setS({ ...s, type: t.value, color: t.color })}
                className={pick(isSelected) + " peony-card"}
              >
                <div className="flex h-16 w-full items-center justify-center transition-transform duration-200 group-hover:scale-105">
                  <BouquetSvg type={t.value} color={t.color} count={6} size={50} wrap={s.wrap} ribbon={s.ribbon} />
                </div>
                <div className="mt-1 flex w-full flex-col items-center">
                  <span className="text-center font-serif text-[12px] font-semibold text-ink line-clamp-1 leading-tight">
                    {t.label}
                  </span>
                  <span className="mt-0.5 text-center text-[10px] text-mute line-clamp-1 leading-snug">
                    {(t as any).desc}
                  </span>
                </div>
                {isSelected && <Tick />}
              </button>
            );
          })}
        </div>
      </Card>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s, category, filteredTypes],
  );

  /* ── Preview Panel (right of top row) ── */
  const previewPanel = useMemo(
    () => (
      <div className="space-y-0">
        {/* Tab Switcher Bar */}
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewTab("letter")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium shadow-xs transition ${previewTab === "letter"
                ? "bg-rose text-white"
                : "border border-blush/60 bg-white/90 text-rose/80 hover:bg-white hover:text-rose"
              }`}
          >
            <Mail size={14} /> Love Letter Preview
          </button>
          <button
            type="button"
            onClick={() => setPreviewTab("bouquet")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium shadow-xs transition ${previewTab === "bouquet"
                ? "bg-rose text-white"
                : "border border-blush/60 bg-white/90 text-rose/80 hover:bg-white hover:text-rose"
              }`}
          >
            <Gift size={14} /> Bouquet & Gift
          </button>
          <button
            type="button"
            onClick={reset}
            className="ml-auto flex items-center gap-1 rounded-full border border-blush/60 bg-white/90 px-3 py-2 text-xs font-medium text-mute shadow-xs transition hover:bg-white hover:text-rose"
          >
            <RotateCcw size={13} aria-hidden /> Reset
          </button>
        </div>

        {/* Preview Display */}
        <div className="relative overflow-hidden rounded-3xl border border-blush/70 bg-gradient-to-b from-[#FFF2F6] via-[#FFE3EC] to-[#F8C6D6] p-6 shadow-lg backdrop-blur-md">
          <RibbonCorner />

          {previewTab === "bouquet" ? (
            <>
              <div key={`${s.type}_${s.wrap}_${s.ribbon}_${s.qty}_${accessories.join("-")}`} className="bloom mt-2 flex items-end justify-center gap-3" style={{ contain: "layout style paint" }}>
                {sideAccs.map((a) => (
                  <div key={a} className="flex flex-col items-center">
                    <div className="drop-shadow-md">
                      <AccessoryPreview value={a as AccessoryValue} size={sideAccs.length > 1 ? 64 : 90} />
                    </div>
                    <span className="mt-1 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-serif text-rose shadow-xs">
                      {ACCESSORIES.find((x) => x.value === a)?.label}
                    </span>
                  </div>
                ))}
                <BouquetSvg
                  type={s.type}
                  count={s.qty}
                  color={s.color}
                  wrap={s.wrap}
                  ribbon={s.ribbon}
                  tag={deferredDedication || "For you"}
                  size={sideAccs.length > 1 ? 150 : sideAccs.length === 1 ? 180 : 240}
                  accessory={accessories}
                />
              </div>
              {/* Ambient Pedestal Shadow */}
              <div className="mx-auto mt-[-10px] h-3.5 w-36 rounded-full bg-rose/15 blur-sm" />
            </>
          ) : (
            /* ── Love Letter Stationery Preview ── */
            <div className="bloom w-full">
              {/* Envelope-style stationery card */}
              <div className="relative mx-auto max-w-sm rounded-2xl border border-blush/80 bg-white/95 p-6 shadow-md">
                {/* Top decorative accent */}
                <div className="absolute -top-1 left-1/2 h-2 w-24 -translate-x-1/2 rounded-b-full bg-gradient-to-r from-pink-200 via-primary/30 to-pink-200" />

                {/* Letter header */}
                <div className="flex items-center justify-between border-b border-blush/50 pb-2.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                    <Heart size={11} className="fill-primary text-primary" />
                    {LETTER_CATEGORIES.find(c => c.value === letterCategory)?.label || "Love Note"}
                  </span>
                  <span className="font-serif text-[11px] italic text-mute">
                    {date ? new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : today}
                  </span>
                </div>

                {/* Letter title */}
                <h3 className="mt-3.5 font-serif text-2xl font-medium italic text-rose">
                  {title || "My Dearest Love"}
                </h3>

                {/* Letter body */}
                <div className="mt-3 min-h-[100px] whitespace-pre-wrap font-serif text-xs leading-relaxed text-ink/90 italic">
                  {message.trim() || "Your love lights up my life, making every moment brighter. I'm so grateful to have you, today and always. ♡"}
                </div>

                {/* Signature */}
                <div className="mt-4 border-t border-blush/40 pt-3 text-right">
                  <span className="font-serif text-sm italic text-rose">
                    {letterSignature || "Forever yours ♡"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s, accessories, previewTab, title, message, letterSignature, letterCategory, date, deferredDedication, today],
  );

  /* ── Left Column (below top row): Quantity, Color, Wrap, Ribbon, Accessories ── */
  const leftColumnBelow = useMemo(
    () => (
      <div className="space-y-5">
        {/* ── QUANTITY SELECTION ── */}
        <Card
          icon={<Flower2 size={18} className="text-primary" aria-hidden />}
          title="Flower Quantity"
          headerRight={<Sparkles size={16} className="text-primary/50" />}
        >
          <div className="flex flex-wrap gap-2.5">
            {QUANTITIES.map((q) => {
              const isSelected = s.qty === q;
              return (
                <button
                  key={q}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setS({ ...s, qty: q })}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition ${isSelected
                      ? "border-primary bg-blush/70 text-rose shadow-xs ring-2 ring-primary/30"
                      : "border-blush/60 bg-white/80 text-ink hover:bg-white"
                    }`}
                >
                  {q} pcs
                </button>
              );
            })}
          </div>
        </Card>

        {/* ── COLOR PALETTE ── */}
        <Card icon={<Palette size={18} className="text-primary" aria-hidden />} title="Color Selection">
          <div className="flex flex-wrap items-center gap-3">
            {COLORS.map((c) => {
              const isSelected = s.color.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${c}`}
                  aria-pressed={isSelected}
                  onClick={() => setS({ ...s, color: c })}
                  style={{ background: c }}
                  className={`h-9 w-9 rounded-full border-2 transition-transform ${isSelected
                      ? "scale-110 border-rose shadow-md ring-2 ring-primary/40"
                      : "border-white shadow-xs hover:scale-105"
                    }`}
                />
              );
            })}
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-blush/70 bg-white/90 px-3 py-2 text-xs font-medium text-ink transition hover:bg-white focus-within:ring-2 focus-within:ring-rose">
              <Palette size={15} aria-hidden /> Custom Color
              <input
                type="color"
                value={s.color}
                onChange={(e) => setS({ ...s, color: e.target.value })}
                className="sr-only"
              />
            </label>
          </div>
        </Card>

        {/* ── WRAPPING STYLE ── */}
        <Card icon={<Gift size={18} className="text-primary" aria-hidden />} title="Wrapping Style">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {WRAPS.map((w) => {
              const isSelected = s.wrap === w.value;
              return (
                <button
                  key={w.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setS({ ...s, wrap: w.value })}
                  className={pick(isSelected)}
                >
                  <BouquetSvg type={s.type} color={s.color} count={6} size={50} wrap={w.value} ribbon={s.ribbon} />
                  <span className="mt-1 text-center font-medium leading-tight">{w.label}</span>
                  {isSelected && <Tick />}
                </button>
              );
            })}
          </div>
        </Card>

        {/* ── RIBBON STYLE ── */}
        <Card icon={<Heart size={18} className="text-primary" aria-hidden />} title="Ribbon Style">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {RIBBONS.map((r) => {
              const isSelected = s.ribbon === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setS({ ...s, ribbon: r.value })}
                  className={pick(isSelected)}
                >
                  <svg viewBox="40 235 220 80" width="60" height="28" aria-hidden>
                    <Bow cx={150} cy={270} color={r.color} tails={false} />
                  </svg>
                  <span className="mt-1 text-center font-medium leading-tight">{r.label}</span>
                  {isSelected && <Tick />}
                </button>
              );
            })}
          </div>
        </Card>

        {/* ── ADD-ON ACCESSORIES ── */}
        <Card icon={<Star size={18} className="text-primary" aria-hidden />} title="Add-on Accessories">
          <p className="mb-3 text-xs text-mute">Pick as many as you like, tap again to remove ♡</p>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            {ACCESSORIES.map((acc) => {
              const isNone = acc.value === "none";
              const isSelected = isNone ? accessories.length === 0 : accessories.includes(acc.value);
              return (
                <button
                  key={acc.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleAccessory(acc.value)}
                  className={pick(isSelected)}
                >
                  {/* Mini accessory preview */}
                  <div className="flex h-16 w-full items-center justify-center transition-transform duration-200 group-hover:scale-105">
                    {isNone ? (
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-blush/60 text-xl text-mute">✕</span>
                    ) : (
                      <div className="scale-75 origin-center">
                        <AccessoryPreview value={acc.value as AccessoryValue} size={56} />
                      </div>
                    )}
                  </div>
                  <div className="mt-1 flex w-full flex-col items-center">
                    <span className="text-center font-serif text-[12px] font-semibold text-ink leading-tight">{acc.label}</span>
                    <span className="mt-0.5 text-center text-[10px] text-mute line-clamp-1 leading-snug">{acc.desc}</span>
                  </div>
                  {isSelected && <Tick />}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s, accessories, filteredTypes],
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FFF2F5] via-[#FFE8F0] to-[#FFDDE8] px-4 py-8 sm:px-8">
      <FloatingDecorations />

      <div className="relative mx-auto max-w-6xl">
        {/* ── Breadcrumb ── */}
        <Link href="/home" className="inline-flex items-center gap-1.5 text-sm font-medium text-mute transition hover:text-rose">
          <Home size={14} /> <ChevronRight size={12} className="text-mute/50" /> Back to Dashboard
        </Link>

        {/* ── Header ── */}
        <div className="mt-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-rose sm:text-4xl italic">
              Create Bouquet & Love Letter
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-rose text-white px-3.5 py-1.5 text-xs font-semibold shadow-md">
              <Heart size={12} className="fill-white" /> All-in-One Gift
            </span>
          </div>
          <p className="mt-1.5 text-sm text-mute">
            Arrange your fresh blooms, pick sweet accessories, and write a love letter that touches their soul.
          </p>
        </div>

        <form action={action} className="mt-6">
          <input type="hidden" name="flower_type" value={s.type} />
          <input type="hidden" name="quantity" value={s.qty} />
          <input type="hidden" name="flower_color" value={s.color} />
          <input type="hidden" name="wrapping_style" value={s.wrap} />
          <input type="hidden" name="ribbon_style" value={s.ribbon} />
          <input type="hidden" name="accessory" value={accessories.join(",") || "none"} />
          <input type="hidden" name="letter_category" value={letterCategory} />
          <input type="hidden" name="letter_signature" value={letterSignature} />
          <input type="hidden" name="create_letter" value={createLetter ? "true" : "false"} />

          {/* ═══════════════════════════════════════════════════
              TOP ROW: Peony Styles (left) + Preview (right)
              ═══════════════════════════════════════════════════ */}
          <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
            <div>{peonyCard}</div>
            <div>{previewPanel}</div>
          </div>

          {/* ═══════════════════════════════════════════════════
              BOTTOM ROW: Build options (left) + Letter form (right)
              ═══════════════════════════════════════════════════ */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
            {/* Left: Quantity, Color, Wrapping, Ribbon, Accessories */}
            {leftColumnBelow}

            {/* Right: Love Letter & Dedication Form */}
            <div>
              <Card icon={<Heart size={18} className="fill-primary text-primary" aria-hidden />} title="Love Letter & Dedication ✦">
                <p className="mb-3.5 text-xs text-mute">
                  The message you write here will accompany the bouquet and also bloom inside their Love Letters collection. ♡
                </p>

                {/* Title */}
                <label className="block text-sm font-medium text-mute">
                  Title / Heading *
                  <div className="relative">
                    <input
                      name="title"
                      required
                      maxLength={120}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. My Dearest Love, A Bouquet for You"
                      className={field + " pr-10"}
                    />
                    <Heart size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 mt-0.5" />
                  </div>
                </label>

                {/* Letter Category */}
                <label className="mt-3.5 block text-sm font-medium text-mute">
                  Letter Theme & Category *
                  <select
                    value={letterCategory}
                    onChange={(e) => setLetterCategory(e.target.value)}
                    className={field}
                  >
                    {LETTER_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.emoji} {c.label}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Letter / Gift Message */}
                <label className="mt-3.5 block text-sm font-medium text-mute">
                  Love Letter & Message *
                  <textarea
                    name="gift_message"
                    required
                    rows={4}
                    maxLength={5000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Pour your heart out here... Write everything you want them to feel and know."
                    className={field + " resize-y"}
                  />
                </label>

                {/* Letter Signature */}
                <div className="mt-3.5">
                  <label className="block text-sm font-medium text-mute">
                    Letter Sign-off / Signature
                    <input
                      value={letterSignature}
                      onChange={(e) => setLetterSignature(e.target.value)}
                      placeholder="Forever yours ♡"
                      className={field}
                    />
                  </label>
                  {/* Quick signature suggestions */}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {["Forever yours ♡", "With all my love ♡", "Always thinking of you ♡", "All my heart ♡"].map((sig) => (
                      <button
                        key={sig}
                        type="button"
                        onClick={() => setLetterSignature(sig)}
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] transition ${letterSignature === sig
                            ? "border-primary bg-blush/60 text-rose"
                            : "border-blush/60 bg-white/70 text-mute hover:bg-white hover:text-rose"
                          }`}
                      >
                        {sig}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dedication Tag & Event Date */}
                <div className="mt-3.5 grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium text-mute">
                    Ribbon Tag Tagline
                    <div className="relative">
                      <input
                        name="dedication"
                        maxLength={30}
                        value={dedication}
                        onChange={(e) => setDedication(e.target.value)}
                        placeholder="e.g. For you ♡"
                        className={field + " pr-8"}
                      />
                      <Heart size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/30 mt-0.5" />
                    </div>
                    <span className="mt-0.5 block text-[10px] text-mute">Shows on hanging tag.</span>
                  </label>
                  <label className="block text-sm font-medium text-mute">
                    Special Date <span className="text-mute/70">(optional)</span>
                    <div className="relative">
                      <input
                        name="event_date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={field}
                      />
                    </div>
                    <span className="mt-0.5 block text-[10px] text-mute">Anniversary date, etc.</span>
                  </label>
                </div>

                {/* Save to Letters Checkbox */}
                <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-blush/60 bg-pink-50/50 p-3 text-xs text-ink transition hover:bg-pink-50">
                  <input
                    type="checkbox"
                    checked={createLetter}
                    onChange={(e) => setCreateLetter(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-primary text-primary"
                  />
                  <span>
                    <strong>Also save to Your Letters 📬</strong> — save this message as a template letter in their collection.
                  </span>
                </label>

                {state.error && (
                  <p role="alert" className="mt-3 rounded-xl bg-red-50 p-2.5 text-sm text-rose">
                    {state.error}
                  </p>
                )}

                {state.success && (
                  <div role="status" className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">
                    <p className="font-medium">{state.message || "Bouquet & Love Letter saved!"}</p>
                    <p className="mt-1 flex flex-wrap gap-2 text-xs">
                      <Link href="/bouquets" className="underline font-medium text-green-900">
                        View in Bouquets →
                      </Link>
                      <span>·</span>
                      <Link href="/letters" className="underline font-medium text-green-900">
                        View in Love Letters →
                      </Link>
                      <span>·</span>
                      <button type="button" onClick={reset} className="underline font-medium text-green-900">
                        Make another
                      </button>
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  disabled={pending}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose to-[#C1123E] px-5 py-3.5 font-semibold text-white shadow-lg transition hover:opacity-95 hover:shadow-xl disabled:opacity-60"
                >
                  <Pencil size={16} aria-hidden />
                  {pending ? "Creating & Sending…" : "Send Bouquet & Love Letter"}
                  <Heart size={14} className="fill-white/80 text-white/80" />
                </button>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}