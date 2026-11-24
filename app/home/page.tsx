import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import Link from "next/link";
import dynamic from "next/dynamic";

// Force dynamic rendering — this page reads cookies (Supabase auth)
export const runtime = "nodejs";
export const fetchCache = "force-no-store";
import { Flower2, Mail, Camera, Gift, Plus, PenLine, LogOut, Eye, Heart, ArrowUpRight, ArrowRight, ChevronRight } from "lucide-react";

const BouquetDisplay = dynamic(() => import("@/components/bouquets/BouquetDisplay"), {
  loading: () => <div className="h-full w-full animate-pulse bg-gradient-to-b from-pink-50 to-transparent rounded-2xl" />,
  ssr: true
});

const BloomBackdrop = dynamic(() => import("@/components/BloomBackdrop"));

const MusicPlayer = dynamic(() => import("@/components/music/MusicPlayer"));

const BouquetCarousel = dynamic(() => import("@/components/bouquets/BouquetCarousel"), {
  loading: () => (
    <div className="relative shrink-0 w-full" style={{ height: "clamp(260px,52vh,560px)" }}>
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse bg-gradient-to-b from-pink-50 to-transparent rounded-3xl w-[clamp(200px,30vw,350px)] h-[clamp(240px,45vh,400px)]" />
      </div>
    </div>
  )
});


const display = { className: "font-playfair" };
const script = { className: "font-vibes" };

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
      .select("id, title, flower_type, flower_items, quantity, flower_color, wrapping_style, ribbon_style, dedication, created_at")
      .eq("status", "published").order("created_at", { ascending: false }).limit(6);
    const newCutoff = Date.now() - 48 * 60 * 60 * 1000; // bouquets younger than 48 h show "New"

    const miniDivider = (heart = 18) => (
      <div className="mx-auto flex items-center justify-center gap-3" aria-hidden>
        <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#0c7a92]/55 sm:w-20" />
        <Heart size={heart} className="fill-[#0c7a92] text-[#0c7a92]" />
        <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#0c7a92]/55 sm:w-20" />
      </div>
    );

    return (
      <div className="relative flex h-dvh flex-col overflow-hidden">
        <style>{`html,body{height:100%;overflow:hidden}`}</style>
        <BloomBackdrop variant="home" />

        <MusicPlayer src="/music/home.mp3" />

        {/* top bar */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 sm:px-8">
          <span className="flex items-center gap-2.5 rounded-full bg-white/55 px-4 py-2 text-[#0a5c72] shadow-md ring-1 ring-white/80 backdrop-blur-sm">
            <Flower2 size={22} className="text-pink-500" aria-hidden />
            <span className="text-sm sm:text-base">Hello, {name} <Heart size={14} className="ml-0.5 inline fill-[#0c7a92] text-[#0c7a92]" aria-hidden /></span>
          </span>
          <form action={signOut}>
            <button className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-sm font-medium text-[#0a5c72] shadow-md ring-1 ring-white/80 backdrop-blur-sm transition hover:bg-white active:scale-95 sm:text-base">
              <LogOut size={18} aria-hidden /> Sign Out
            </button>
          </form>
        </div>

        {/* everything below fits the screen height, so the page never scrolls */}
        <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col items-center justify-evenly px-6 pb-[2vh] pt-16 text-center sm:pt-[2vh]">
          <header>
            {miniDivider()}
            <h1 className="mt-[1.2vh]">
              <span className={`${display.className} block text-[clamp(1.4rem,5.4vh,3.6rem)] font-normal leading-tight text-[#0a6379]`}>A Little World</span>
              <span className={`${script.className} block whitespace-nowrap text-[length:clamp(1.9rem,min(9.2vh,calc((100vw-3rem)/7.4)),6rem)] leading-[1.05] text-[#0c7a92]`}>Made Just for You</span>
            </h1>
            <p className={`${display.className} mt-[0.6vh] text-[clamp(0.8rem,2.1vh,1.25rem)] text-[#0b6b82]`}>Every little thing here was saved with you in mind.</p>
            <div className="mt-[1.2vh]">{miniDivider(16)}</div>
          </header>

          {error && <p role="alert" className="text-rose">Bouquets couldn't load. Please try again.</p>}
          {!error && !gifts?.length && (
            <div className="max-w-md rounded-[2rem] border border-white/70 bg-white/70 p-8 text-mute">
              No bouquets have arrived yet. Come back soon ♡
            </div>
          )}

          {!!gifts?.length && (
            // oldest → newest, so the row ends on the latest upload (the one tagged NEW).
            // To end on the oldest instead, drop the .reverse() and set initialIndex={0}.
            <BouquetCarousel
              titleClass={display.className}
              initialIndex={gifts.length - 1}
              items={[...gifts].reverse().map((b) => ({ id: b.id, title: b.title, isNew: new Date(b.created_at).getTime() > newCutoff, art: <BouquetDisplay bouquet={b} size={210} /> }))}
            />
          )}

          {/* Prefetch bouquet detail pages for faster navigation */}
          <div className="hidden">
            {gifts?.slice(0, 3).map((b) => (
              <Link key={b.id} href={`/bouquets/${b.id}`} prefetch={true} />
            ))}
          </div>

          <footer>
            {miniDivider(26)}
            <p className={`${display.className} mt-[1vh] text-[clamp(0.85rem,2.1vh,1.2rem)] italic text-[#0b6b82]`}>{footer} <Heart size={18} className="ml-1 inline text-[#0b6b82]" aria-hidden /></p>
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