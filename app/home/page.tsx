import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import Link from "next/link";
import BouquetDisplay from "@/components/bouquets/BouquetDisplay";
import MusicPlayer from "@/components/music/MusicPlayer";
import { Flower2, Mail, Camera, Gift, Plus, PenLine, LogOut, Eye, Heart, ArrowUpRight, ArrowRight, User } from "lucide-react";
import { Playfair_Display, Great_Vibes } from "next/font/google";

const display = Playfair_Display({ subsets: ["latin"], weight: ["500", "700"], style: ["normal", "italic"] });
const script = Great_Vibes({ subsets: ["latin"], weight: "400" });

/* ───────── Decorative pieces for the recipient page ───────── */
function Peony({ className = "" }: { className?: string }) {
  const ring = (n: number, cy: number, rx: number, ry: number, off: number, fill: string) =>
    Array.from({ length: n }, (_, i) => (
      <ellipse key={`${fill}${i}`} cx="200" cy={cy} rx={rx} ry={ry} fill={fill}
        stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" transform={`rotate(${off + (360 / n) * i} 200 200)`} />
    ));
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden>
      <defs>
        <radialGradient id="peO" cx="50%" cy="85%" r="90%"><stop offset="0" stopColor="#06b6d4" /><stop offset="1" stopColor="#cffafe" /></radialGradient>
        <radialGradient id="peM" cx="50%" cy="85%" r="90%"><stop offset="0" stopColor="#0891b2" /><stop offset="1" stopColor="#a5f3fc" /></radialGradient>
        <radialGradient id="peI" cx="50%" cy="85%" r="90%"><stop offset="0" stopColor="#0e7490" /><stop offset="1" stopColor="#67e8f9" /></radialGradient>
        <radialGradient id="peC"><stop offset="0" stopColor="#ecfeff" /><stop offset="1" stopColor="#22d3ee" /></radialGradient>
        <filter id="peBlur"><feGaussianBlur stdDeviation="1.6" /></filter>
      </defs>
      <g filter="url(#peBlur)" opacity=".92">
        {ring(9, 105, 64, 100, 0, "url(#peO)")}
        {ring(7, 135, 52, 76, 25, "url(#peM)")}
        {ring(6, 160, 38, 54, 10, "url(#peI)")}
        <circle cx="200" cy="200" r="22" fill="url(#peC)" />
      </g>
    </svg>
  );
}

function Petal({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 20 34" className={`pointer-events-none absolute ${className}`} style={style} aria-hidden>
      <defs><linearGradient id="ptl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a5f3fc" /><stop offset="1" stopColor="#06b6d4" /></linearGradient></defs>
      <path d="M10 0C22 6 22 24 10 34 -2 24 -2 6 10 0Z" fill="url(#ptl)" opacity=".8" />
    </svg>
  );
}

function Sparkle({ className = "", size = 18 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`pointer-events-none absolute text-primary/70 ${className}`} aria-hidden>
      <path d="M12 0C12.8 7 17 11.2 24 12 17 12.8 12.8 17 12 24 11.2 17 7 12.8 0 12 7 11.2 11.2 7 12 0Z" fill="currentColor" />
    </svg>
  );
}

const PETALS: { l: string; t: string; r: number; s: number; d: number }[] = [
  { l: "26%", t: "20%", r: -40, s: 1.3, d: 0 }, { l: "9%", t: "36%", r: 70, s: 1.1, d: 1.5 },
  { l: "5%", t: "58%", r: -20, s: 1.6, d: 3 }, { l: "20%", t: "86%", r: 120, s: 1.2, d: 2 },
  { l: "92%", t: "20%", r: 50, s: 1.5, d: 1 }, { l: "86%", t: "35%", r: -70, s: 1, d: 2.5 },
  { l: "77%", t: "52%", r: 100, s: 1.3, d: 0.5 }, { l: "74%", t: "72%", r: -30, s: 0.9, d: 3.5 },
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
      .eq("status", "published").order("created_at", { ascending: false });

    const divider = (
      <div className="mx-auto flex items-center justify-center gap-3" aria-hidden>
        <span className="h-px w-28 bg-gradient-to-r from-transparent to-primary/50" />
        <Heart size={20} className="fill-primary text-primary drop-shadow" />
        <span className="h-px w-28 bg-gradient-to-l from-transparent to-primary/50" />
      </div>
    );

    return (
      <div className="relative flex h-dvh flex-col overflow-hidden bg-gradient-to-br from-[#ecfeff] via-[#a5f3fc] to-[#67e8f9]">
        <style>{`html,body{height:100%;overflow:hidden}
@keyframes bfy-drift{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-14px) rotate(calc(var(--r) + 14deg))}}
.bfy-row{scrollbar-width:none}.bfy-row::-webkit-scrollbar{display:none}`}</style>

        {/* soft haze */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" aria-hidden />

        {/* peonies */}
        <Peony className="pointer-events-none absolute -left-24 -top-24 w-[240px] -rotate-12 opacity-80 sm:-left-28 sm:-top-28 sm:w-[400px]" />
        <Peony className="pointer-events-none absolute -right-28 top-[30%] hidden w-[300px] rotate-45 opacity-40 blur-[2px] sm:block" />
        <Peony className="pointer-events-none absolute -bottom-24 -right-28 w-[280px] rotate-12 sm:-bottom-32 sm:-right-32 sm:w-[480px]" />

        {/* petals + sparkles */}
        {PETALS.map((p, i) => (
          <Petal key={i} className="hidden sm:block" style={{ left: p.l, top: p.t, width: 20 * p.s, ["--r" as any]: `${p.r}deg`, animation: `bfy-drift ${7 + (i % 3)}s ease-in-out ${p.d}s infinite` }} />
        ))}
        <Sparkle className="left-[22%] top-[34%] hidden sm:block" size={26} />
        <Sparkle className="left-[14%] top-[70%] hidden sm:block" size={18} />
        <Sparkle className="right-[22%] top-[14%] hidden sm:block" size={16} />
        <Sparkle className="right-[6%] top-[9%] hidden sm:block" size={14} />

        {/* curved line with outline heart */}
        <svg viewBox="0 0 900 260" className="pointer-events-none absolute right-0 top-0 hidden h-[260px] w-[min(62vw,900px)] lg:block" aria-hidden fill="none" stroke="#c2476f" strokeWidth="1.4" strokeLinecap="round">
          <path d="M0 150 C 90 160 170 150 250 120 C 330 90 360 60 400 70 C 430 78 440 108 410 124 C 384 138 360 112 372 92 C 392 62 440 78 470 118 C 520 96 640 92 760 40 C 810 18 850 -10 880 -40" opacity=".55" />
        </svg>

        <MusicPlayer src="/music/home.mp3" />

        {/* top bar */}
        <div className="relative z-10 flex shrink-0 items-center justify-between px-6 py-4 sm:px-10">
          <span className="flex items-center gap-3 text-ink">
            <Flower2 size={30} className="text-rose" aria-hidden />
            <span className="text-sm sm:text-base">Hello, {name} <Heart size={15} className="ml-0.5 inline fill-rose text-rose" aria-hidden /></span>
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-rose shadow-md ring-1 ring-white" aria-hidden><User size={18} fill="currentColor" /></span>
        </div>

        {/* everything below fits the screen height, so the page never scrolls */}
        <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col items-center justify-evenly px-6 pb-3 text-center">
          <header>
            {divider}
            <h1 className="mt-[1vh]">
              <span className={`${display.className} block text-[clamp(1.6rem,5vh,3.5rem)] font-bold leading-tight tracking-wide text-ink`}>A Little World</span>
              <span className={`${script.className} block text-[clamp(2.2rem,8vh,5.5rem)] leading-[1.05] text-rose drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)]`}>Made Just for You</span>
            </h1>
            <p className="mt-[1vh] text-[clamp(0.75rem,1.8vh,1rem)] text-mute">Every little thing here was saved with you in mind.</p>
            <div className="mx-auto mt-[1.2vh] h-0.5 w-14 rounded-full bg-gradient-to-r from-rose to-primary" aria-hidden />
          </header>

          {error && <p role="alert" className="text-rose">Bouquets couldn't load. Please try again.</p>}
          {!error && !gifts?.length && (
            <div className="max-w-md rounded-[2rem] border border-white/70 bg-white/50 p-8 text-mute backdrop-blur-xl">
              No bouquets have arrived yet. Come back soon ♡
            </div>
          )}

          {/* bouquets: centered when few, swipe sideways when many (no page scroll) */}
          {!!gifts?.length && (
            <ul className="bfy-row flex w-max max-w-full gap-6 overflow-x-auto overflow-y-hidden px-3 pb-6 pt-2 snap-x snap-mandatory sm:gap-8">
              {gifts.map((b) => (
                <li key={b.id} className="w-[clamp(210px,34vh,300px)] shrink-0 snap-center">
                  <Link href={`/bouquets/${b.id}`} className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <div className="flex h-[clamp(150px,33vh,300px)] justify-center drop-shadow-[0_18px_22px_rgba(8,145,178,0.35)] transition duration-300 group-hover:-translate-y-1.5 group-hover:scale-105 [&>svg]:h-full [&>svg]:w-auto">
                      <BouquetDisplay bouquet={b} size={210} />
                    </div>
                    <div className="mx-auto mt-[1.5vh] flex w-full items-center rounded-full border border-white bg-white/60 py-1.5 pl-5 pr-1.5 shadow-sm backdrop-blur">
                      <span className={`${display.className} flex-1 truncate text-center text-base font-medium text-ink`}>{b.title}</span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-rose text-white shadow-md transition group-hover:translate-x-0.5" aria-hidden><ArrowRight size={15} /></span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <footer>
            {divider}
            <p className={`${display.className} mt-[1vh] text-[clamp(0.8rem,1.9vh,1rem)] italic text-rose/80`}>{footer} <Heart size={14} className="ml-1 inline text-rose" aria-hidden /></p>
            <form action={signOut} className="mt-[1.5vh]">
              <button className="inline-flex items-center gap-2 rounded-full border border-rose/50 bg-white/50 px-6 py-2 text-sm font-medium text-rose shadow-sm backdrop-blur transition hover:bg-white hover:shadow-md active:scale-95">
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
    supabase.from("letters").select("id, title, preview, category").order("created_at", { ascending: false }),
    supabase.from("bouquets")
      .select("id, title, flower_type, flower_items, quantity, flower_color, wrapping_style, ribbon_style, dedication")
      .eq("status", "published").order("created_at", { ascending: false }),
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
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blush/50 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-primary/15 blur-3xl" aria-hidden />

      <main className="relative mx-auto max-w-5xl px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-serif text-lg text-rose"><Heart size={16} className="fill-primary text-primary" aria-hidden /> Bloom for You</span>
          <form action={signOut}>
            <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-mute transition hover:bg-white hover:text-rose"><LogOut size={14} aria-hidden /> Sign out</button>
          </form>
        </div>

        {/* Hero */}
        <header className="mt-8 rounded-3xl border border-blush/60 bg-white/70 p-8 text-center shadow-sm backdrop-blur-md sm:p-10">
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
            <li key={label} className="flex items-center gap-3 rounded-2xl border border-blush/60 bg-white/80 p-4 shadow-xs backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blush/70 to-pink-100 text-rose"><Icon size={20} aria-hidden /></span>
              <div>
                <p className="font-serif text-2xl leading-none text-rose">{counts[i]}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-mute">{label}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Posted bouquets */}
        <section className="mt-14" aria-labelledby="bouquets-h">
          <SectionHead id="bouquets-h" title="Posted Bouquets" sub="The bouquets you've sent with love" href="/bouquets" />
          {bouquetsR.error && <p role="alert" className="mt-5 text-rose">Bouquets couldn't load. Please try again.</p>}
          {!bouquetsR.error && !bouquets?.length && (
            <div className="mt-5 rounded-2xl border border-dashed border-blush bg-white/60 p-10 text-center text-mute">
              No bouquets posted yet. <Link href="/admin/bouquets/new" className="text-primary underline">Create your first one</Link> ♡
            </div>
          )}
          <ul className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {bouquets?.map((b) => (
              <li key={b.id}>
                <Link href={`/bouquets/${b.id}`} className="group relative flex h-full flex-col items-center rounded-3xl border border-blush/60 bg-white/85 p-5 shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <ArrowUpRight size={16} className="absolute right-3 top-3 text-primary opacity-0 transition group-hover:opacity-100" aria-hidden />
                  <div className="h-[190px] rounded-2xl bg-gradient-to-b from-pink-50 to-transparent p-2 transition group-hover:scale-105">
                    <BouquetDisplay bouquet={b} size={130} />
                  </div>
                  <span className="mt-3 text-center font-serif text-ink">{b.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Letters */}
        <section className="mt-14" aria-labelledby="letters-h">
          <SectionHead id="letters-h" title="Letters" sub="Words you've written from the heart" href="/letters" />
          {lettersR.error && <p role="alert" className="mt-5 text-rose">Letters couldn't load. Please try again.</p>}
          {!lettersR.error && !letters?.length && (
            <div className="mt-5 rounded-2xl border border-dashed border-blush bg-white/60 p-10 text-center text-mute">
              No letters written yet. <Link href="/admin/letters" className="text-primary underline">Write the first one</Link> ♡
            </div>
          )}
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {letters?.map((l) => (
              <li key={l.id}>
                <Link href={`/letters/${l.id}`} className="group block h-full rounded-2xl border border-blush/60 border-l-4 border-l-primary bg-white/85 p-5 shadow-xs transition duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary"><Mail size={12} aria-hidden /> {label(l.category)}</p>
                  <p className="mt-2 font-serif text-xl text-ink">{l.title}</p>
                  {l.preview && <p className="mt-1 line-clamp-2 text-sm text-mute">{l.preview}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-16 text-center text-sm text-mute">{footer} ♡</footer>
      </main>
    </div>
  );
}