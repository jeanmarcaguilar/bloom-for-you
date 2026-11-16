import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Flower2, Mail, Camera, Gift, Plus, PenLine, LogOut, Eye, Heart, ArrowUpRight, ArrowRight } from "lucide-react";

const BouquetDisplay = dynamic(() => import("@/components/bouquets/BouquetDisplay"), {
  loading: () => <div className="h-full w-full animate-pulse bg-gradient-to-b from-pink-50 to-transparent rounded-2xl" />,
  ssr: true
});

import MusicPlayer from "@/components/music/MusicPlayer";
import BouquetCarousel from "@/components/bouquets/BouquetCarousel";


const display = { className: "font-playfair" };
const script = { className: "font-vibes" };

/* ───────── Decorative pieces for the recipient page ───────── */
const petalPath = (L: number, W: number) =>
  `M0 0C${-W * 0.95} ${-L * 0.2} ${-W * 1.2} ${-L * 0.76} ${-W * 0.5} ${-L * 0.96}` +
  `Q${-W * 0.28} ${-L * 1.03} ${-W * 0.1} ${-L * 0.97}Q0 ${-L * 0.94} ${W * 0.1} ${-L * 0.97}` +
  `Q${W * 0.28} ${-L * 1.03} ${W * 0.5} ${-L * 0.96}C${W * 1.2} ${-L * 0.76} ${W * 0.95} ${-L * 0.2} 0 0Z`;

/* big, soft, see-through peony (static, no filters, so it costs almost nothing to paint) */
function Peony({ id, className = "" }: { id: string; className?: string }) {
  const rings = [
    { n: 9, L: 190, W: 70, off: 0, o: 0.55 },
    { n: 8, L: 150, W: 60, off: 12, o: 0.65 },
    { n: 7, L: 110, W: 50, off: 24, o: 0.75 },
    { n: 6, L: 72, W: 38, off: 6, o: 0.85 },
  ];
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#22b8d6" stopOpacity=".7" />
          <stop offset=".5" stopColor="#a5f3fc" stopOpacity=".6" />
          <stop offset="1" stopColor="#fff" stopOpacity=".95" />
        </linearGradient>
        <radialGradient id={`${id}c`}><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#67e8f9" /></radialGradient>
      </defs>
      {rings.map((r, ri) =>
        Array.from({ length: r.n }, (_, i) => (
          <g key={`${ri}-${i}`} transform={`translate(200 200) rotate(${r.off + (360 / r.n) * i + ((i * 7 + ri * 3) % 5) * 2}) translate(0 -6)`} opacity={r.o}>
            <path d={petalPath(r.L, r.W)} fill={`url(#${id}g)`} stroke="#fff" strokeOpacity=".8" strokeWidth="1.4" />
            <path d={`M0 ${-r.L * 0.08}L0 ${-r.L * 0.8}M0 ${-r.L * 0.1}Q${-r.W * 0.3} ${-r.L * 0.45} ${-r.W * 0.5} ${-r.L * 0.78}M0 ${-r.L * 0.1}Q${r.W * 0.3} ${-r.L * 0.45} ${r.W * 0.5} ${-r.L * 0.78}`} fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth=".9" />
          </g>
        ))
      )}
      <circle cx="200" cy="200" r="16" fill={`url(#${id}c)`} />
    </svg>
  );
}

function Leaf({ id, className = "" }: { id: string; className?: string }) {
  return (
    <svg viewBox="-60 -190 120 200" className={`pointer-events-none absolute ${className}`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2=".4" y2="0">
          <stop offset="0" stopColor="#22b8d6" stopOpacity=".75" />
          <stop offset="1" stopColor="#e0fbff" stopOpacity=".85" />
        </linearGradient>
      </defs>
      <path d="M0 0C42 -38 46 -120 0 -184 -46 -120 -42 -38 0 0Z" fill={`url(#${id})`} stroke="#fff" strokeOpacity=".7" strokeWidth="1.5" />
      <path d="M0 -4L0 -170" stroke="#fff" strokeOpacity=".55" strokeWidth="1.4" fill="none" />
    </svg>
  );
}

function Petal({ className = "", style, tone = "cyan" }: { className?: string; style?: React.CSSProperties; tone?: "cyan" | "pink" }) {
  const [a, b] = tone === "pink" ? ["#fbcfe8", "#f9a8d4"] : ["#cffafe", "#22d3ee"];
  return (
    <svg viewBox="0 0 20 34" className={`bfy-petal pointer-events-none absolute will-change-transform ${className}`} style={style} aria-hidden>
      <defs><linearGradient id={`ptl-${tone}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
      <path d="M10 0C22 6 22 24 10 34 -2 24 -2 6 10 0Z" fill={`url(#ptl-${tone})`} opacity=".85" />
    </svg>
  );
}

const PETALS: { l: string; t: string; r: number; s: number; d: number; tone: "cyan" | "pink" }[] = [
  { l: "30%", t: "14%", r: -40, s: 1.4, d: 0, tone: "cyan" },
  { l: "12%", t: "52%", r: 70, s: 1.2, d: 1.5, tone: "cyan" },
  { l: "22%", t: "84%", r: 120, s: 1.5, d: 2, tone: "pink" },
  { l: "80%", t: "12%", r: 50, s: 1.5, d: 1, tone: "cyan" },
  { l: "84%", t: "30%", r: -70, s: 1.2, d: 2.5, tone: "pink" },
  { l: "76%", t: "86%", r: 100, s: 1.2, d: 3, tone: "cyan" },
];

const label = (c: string) => c.replace(/_/g, " ").replace(/^\w/, (m) => m.toUpperCase());

export default async function Home() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: s } = await supabase.from("site_settings").select("recipient_display_name, footer_message").maybeSingle();
  const name = s?.recipient_display_name || user.displayName || "you";
  const footer = s?.footer_message ?? "Made with love, one little memory at a time.";

  // ───────────── Recipient: pretty bouquet display ─────────────
  if (user.role !== "owner") {
    const { data: gifts, error } = await supabase
      .from("bouquets")
      .select("id, title, flower_type, flower_items, quantity, flower_color, wrapping_style, ribbon_style, dedication")
      .eq("status", "published").order("created_at", { ascending: false }).limit(12);

    const divider = (
      <div className="mx-auto flex items-center justify-center gap-3" aria-hidden>
        <span className="h-px w-28 bg-gradient-to-r from-transparent to-primary/50" />
        <Heart size={20} className="fill-primary text-primary drop-shadow" />
        <span className="h-px w-28 bg-gradient-to-l from-transparent to-primary/50" />
      </div>
    );

    return (
      <div className="relative flex h-dvh flex-col overflow-hidden bg-gradient-to-br from-[#f0fdff] via-[#b6f1f9] to-[#7fe3f1]">
        <style>{`html,body{height:100%;overflow:hidden}
@keyframes bfy-drift{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-14px) rotate(calc(var(--r) + 14deg))}}
@media (prefers-reduced-motion:reduce){.bfy-petal{animation:none!important}}`}</style>

        {/* soft haze */}
        <div className="pointer-events-none absolute left-1/2 top-[45%] h-[70vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(255,255,255,0.6),transparent)]" aria-hidden />

        {/* big translucent peonies, leaves and a gentle wave */}
        <Leaf id="lfa" className="-left-8 top-[30%] hidden w-[140px] rotate-[105deg] sm:block" />
        <Leaf id="lfb" className="-bottom-6 left-[2%] hidden w-[170px] rotate-[60deg] sm:block" />
        <Peony id="pa" className="pointer-events-none absolute -left-24 -top-28 w-[300px] -rotate-12 sm:-left-36 sm:-top-44 sm:w-[580px]" />
        <Peony id="pb" className="pointer-events-none absolute -bottom-28 -right-24 w-[260px] rotate-[20deg] sm:-bottom-48 sm:-right-40 sm:w-[560px]" />
        <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-[20vh] w-full" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden>
          <path d="M0 120C240 60 420 200 720 140S1200 60 1440 130V220H0Z" fill="#fff" fillOpacity=".28" />
          <path d="M0 170C300 110 520 220 820 170S1250 120 1440 175V220H0Z" fill="#a5f3fc" fillOpacity=".4" />
        </svg>

        {/* drifting petals */}
        {PETALS.map((p, i) => (
          <Petal key={i} tone={p.tone} className="hidden sm:block" style={{ left: p.l, top: p.t, width: 20 * p.s, ["--r" as any]: `${p.r}deg`, animation: `bfy-drift ${7 + (i % 3)}s ease-in-out ${p.d}s infinite` }} />
        ))}

        <MusicPlayer src="/music/home.mp3" />

        {/* top bar */}
        <div className="relative z-10 flex shrink-0 items-center justify-between px-5 py-4 sm:px-10">
          <span className="flex items-center gap-2.5 rounded-full bg-white/55 px-4 py-2 text-ink shadow-md ring-1 ring-white/80 backdrop-blur-sm">
            <Flower2 size={22} className="text-pink-500" aria-hidden />
            <span className="text-sm sm:text-base">Hello, {name} <Heart size={14} className="ml-0.5 inline fill-pink-500 text-pink-500" aria-hidden /></span>
          </span>
        </div>

        {/* everything below fits the screen height, so the page never scrolls */}
        <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col items-center justify-evenly px-6 pb-3 text-center">
          <header>
            {divider}
            <h1 className="mt-[1vh]">
              <span className={`${display.className} block text-[clamp(1.25rem,4vh,3.5rem)] font-bold leading-tight tracking-wide text-ink`}>A Little World</span>
              <span className={`${script.className} block text-[clamp(1.7rem,6.2vh,5.5rem)] leading-[1.05] text-[#e11d5f] drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)]`}>Made Just for You</span>
            </h1>
            <p className={`${display.className} mt-[1vh] text-[clamp(0.7rem,1.7vh,1.05rem)] text-ink/75`}>Every little thing here was saved with you in mind.</p>
            <div className="mt-[1vh]">{divider}</div>
          </header>

          {error && <p role="alert" className="text-rose">Bouquets couldn't load. Please try again.</p>}
          {!error && !gifts?.length && (
            <div className="max-w-md rounded-[2rem] border border-white/70 bg-white/70 p-8 text-mute">
              No bouquets have arrived yet. Come back soon ♡
            </div>
          )}

          {!!gifts?.length && (
            <BouquetCarousel
              titleClass={display.className}
              items={gifts.map((b) => ({ id: b.id, title: b.title, art: <BouquetDisplay bouquet={b} size={210} /> }))}
            />
          )}

          <footer>
            {divider}
            <p className={`${display.className} mt-[1vh] text-[clamp(0.8rem,1.9vh,1rem)] italic text-ink/80`}>{footer} <Heart size={15} className="ml-1 inline text-pink-500" aria-hidden /></p>
            <form action={signOut} className="mt-[1.5vh]">
              <button className="inline-flex items-center gap-2 rounded-full border border-pink-400/70 bg-white/60 px-6 py-2 text-sm font-medium text-pink-600 shadow-sm transition-colors hover:bg-white hover:shadow-md active:scale-95">
                <LogOut size={16} aria-hidden /> Sign Out
              </button>
            </form>
          </footer>
        </main>
      </div>
    );
  }

  // ───────────── Owner: everything on ONE page ─────────────
  const stats = [
    { table: "bouquets", label: "Bouquets", Icon: Flower2 },
    { table: "letters", label: "Letters", Icon: Mail },
    { table: "memories", label: "Memories", Icon: Camera },
    { table: "surprises", label: "Surprises", Icon: Gift },
  ] as const;
  const [counts, lettersR, bouquetsR] = await Promise.all([
    Promise.all(stats.map(async ({ table }) => {
      const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
      return count ?? 0;
    })),
    supabase.from("letters").select("id, title, preview, category").order("created_at", { ascending: false }).limit(4),
    supabase.from("bouquets")
      .select("id, title, flower_type, flower_items, quantity, flower_color, wrapping_style, ribbon_style, dedication")
      .eq("status", "published").order("created_at", { ascending: false }).limit(6),
  ]);
  const letters = lettersR.data, bouquets = bouquetsR.data;

  const primaryBtn = "group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-rose px-6 py-3 text-sm font-medium text-white shadow-md shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95";
  const ghostLink = "inline-flex items-center gap-1 rounded-full border border-blush bg-white/70 px-3 py-1.5 text-xs text-rose transition hover:border-primary hover:bg-white";

  const SectionHead = ({ id, title, sub, href }: { id: string; title: string; sub: string; href: string }) => (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="flex items-center gap-2 font-serif text-2xl text-rose">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary" aria-hidden />{title}
        </h2>
        <p className="mt-1 text-sm text-mute">{sub}</p>
      </div>
      <Link href={href} className={ghostLink}><Eye size={13} aria-hidden /> View as recipient</Link>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-cyan-100 via-cyan-50 to-white">
      {/* soft background glows */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 bg-blush/50 [mask-image:radial-gradient(closest-side,#000,transparent)]" aria-hidden />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 bg-primary/25 [mask-image:radial-gradient(closest-side,#000,transparent)]" aria-hidden />

      <main className="relative mx-auto max-w-5xl px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-serif text-lg text-rose"><Heart size={16} className="fill-primary text-primary" aria-hidden /> Bloom for You</span>
          <form action={signOut}>
            <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-mute transition hover:bg-white hover:text-rose"><LogOut size={14} aria-hidden /> Sign out</button>
          </form>
        </div>

        {/* Hero */}
        <header className="mt-8 rounded-3xl border border-blush/60 bg-white/85 p-8 text-center shadow-sm sm:p-10">
          <p className="text-sm tracking-wide text-mute">Hello, {user.displayName || "owner"} ♡</p>
          <h1 className="mt-2 font-serif text-4xl text-rose sm:text-5xl">Your Dashboard</h1>
          <p className="mx-auto mt-3 max-w-md text-mute">Everything you've made for {name}, all in one little place.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/admin/bouquets/new" className={primaryBtn}><Plus size={16} aria-hidden /> Create New Bouquet</Link>
            <Link href="/admin/letters" className={primaryBtn}><PenLine size={16} aria-hidden /> Write a Letter</Link>
          </div>
        </header>

        {/* Stats */}
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(({ label, Icon }, i) => (
            <li key={label} className="flex items-center gap-3 rounded-2xl border border-blush/60 bg-white/85 p-4 shadow-xs transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blush/70 to-pink-100 text-rose"><Icon size={20} aria-hidden /></span>
              <div>
                <p className="font-serif text-2xl leading-none text-rose">{counts[i]}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-mute">{label}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Posted bouquets */}
        <section className="mt-14 [content-visibility:auto] [contain-intrinsic-size:auto_700px] -mx-4 px-4 pb-6" aria-labelledby="bouquets-h">
          <SectionHead id="bouquets-h" title="Posted Bouquets" sub="The bouquets you've sent with love" href="/bouquets" />
          {bouquetsR.error && <p role="alert" className="mt-5 text-rose">Bouquets couldn't load. Please try again.</p>}
          {!bouquetsR.error && !bouquets?.length && (
            <div className="mt-5 rounded-2xl border border-dashed border-blush bg-white/60 p-10 text-center text-mute">
              No bouquets posted yet. <Link href="/admin/bouquets/new" className="text-primary underline">Create your first one</Link> ♡
            </div>
          )}
          <ul className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {bouquets?.slice(0, 6).map((b) => (
              <li key={b.id}>
                <Link href={`/bouquets/${b.id}`} className="group relative flex h-full flex-col items-center rounded-3xl border border-blush/60 bg-white/85 p-5 shadow-xs transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <ArrowUpRight size={16} className="absolute right-3 top-3 text-primary opacity-0 transition group-hover:opacity-100" aria-hidden />
                  <div className="h-[190px] rounded-2xl bg-gradient-to-b from-pink-50 to-transparent p-2 transition-transform group-hover:scale-105">
                    <BouquetDisplay bouquet={b} size={130} />
                  </div>
                  <span className="mt-3 text-center font-serif text-ink">{b.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          {bouquets && bouquets.length > 6 && (
            <div className="mt-6 text-center">
              <Link href="/bouquets" className="inline-flex items-center gap-2 rounded-full border border-blush bg-white/85 px-6 py-2.5 text-sm font-medium text-rose shadow-sm transition hover:bg-white hover:shadow-md">
                View All {bouquets.length} Bouquets <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          )}
        </section>

        {/* Letters */}
        <section className="mt-14 [content-visibility:auto] [contain-intrinsic-size:auto_500px] -mx-4 px-4 pb-6" aria-labelledby="letters-h">
          <SectionHead id="letters-h" title="Letters" sub="Words you've written from the heart" href="/letters" />
          {lettersR.error && <p role="alert" className="mt-5 text-rose">Letters couldn't load. Please try again.</p>}
          {!lettersR.error && !letters?.length && (
            <div className="mt-5 rounded-2xl border border-dashed border-blush bg-white/60 p-10 text-center text-mute">
              No letters written yet. <Link href="/admin/letters" className="text-primary underline">Write the first one</Link> ♡
            </div>
          )}
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {letters?.slice(0, 4).map((l) => (
              <li key={l.id}>
                <Link href={`/letters/${l.id}`} className="group block h-full rounded-2xl border border-blush/60 border-l-4 border-l-primary bg-white/85 p-5 shadow-xs transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary"><Mail size={12} aria-hidden /> {label(l.category)}</p>
                  <p className="mt-2 font-serif text-xl text-ink">{l.title}</p>
                  {l.preview && <p className="mt-1 line-clamp-2 text-sm text-mute">{l.preview}</p>}
                </Link>
              </li>
            ))}
          </ul>
          {letters && letters.length > 4 && (
            <div className="mt-6 text-center">
              <Link href="/letters" className="inline-flex items-center gap-2 rounded-full border border-blush bg-white/85 px-6 py-2.5 text-sm font-medium text-rose shadow-sm transition hover:bg-white hover:shadow-md">
                View All {letters.length} Letters <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          )}
        </section>

        <footer className="mt-16 text-center text-sm text-mute">{footer} ♡</footer>
      </main>
    </div>
  );
}