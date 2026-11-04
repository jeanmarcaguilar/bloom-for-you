import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import BouquetDisplay from "@/components/bouquets/BouquetDisplay";
import LetterModal from "./letter-modal";
import MusicPlayer from "@/components/music/MusicPlayer";


/* ───────── Decorative pieces (same look as the home page) ───────── */
function Peony({ className = "" }: { className?: string }) {
  const ring = (n: number, cy: number, rx: number, ry: number, off: number, fill: string) =>
    Array.from({ length: n }, (_, i) => (
      <ellipse key={`${fill}${i}`} cx="200" cy={cy} rx={rx} ry={ry} fill={fill}
        stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" transform={`rotate(${off + (360 / n) * i} 200 200)`} />
    ));
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden>
      <defs>
        <radialGradient id="peO" cx="50%" cy="85%" r="90%"><stop offset="0" stopColor="#4fd1e6" /><stop offset="1" stopColor="#d4f8ff" /></radialGradient>
        <radialGradient id="peM" cx="50%" cy="85%" r="90%"><stop offset="0" stopColor="#22c5dc" /><stop offset="1" stopColor="#b5f3fc" /></radialGradient>
        <radialGradient id="peI" cx="50%" cy="85%" r="90%"><stop offset="0" stopColor="#0aaec9" /><stop offset="1" stopColor="#8aeaf7" /></radialGradient>
        <radialGradient id="peC"><stop offset="0" stopColor="#fff7c2" /><stop offset="1" stopColor="#7fd6e8" /></radialGradient>
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

function Petal({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 20 34" className="pointer-events-none absolute hidden sm:block" style={style} aria-hidden>
      <defs><linearGradient id="ptl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a5f3fc" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
      <path d="M10 0C22 6 22 24 10 34 -2 24 -2 6 10 0Z" fill="url(#ptl)" opacity=".8" />
    </svg>
  );
}

const PETALS = [
  { l: "8%", t: "30%", r: 70, s: 1.1, d: 1.5 }, { l: "5%", t: "62%", r: -20, s: 1.5, d: 3 },
  { l: "93%", t: "22%", r: 50, s: 1.4, d: 1 }, { l: "88%", t: "46%", r: -70, s: 1, d: 2.5 },
  { l: "52%", t: "92%", r: 100, s: 1.1, d: 0.5 },
];

export default async function BouquetPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data: b } = await supabase.from("bouquets").select("*").eq("id", id).maybeSingle();
  if (!b) notFound();
  const { data: settings } = await supabase.from("site_settings").select("recipient_display_name").maybeSingle();
  const greeting = `Dear ${settings?.recipient_display_name || "you"},`;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-gradient-to-br from-[#f0fdff] via-[#cffafe] to-[#a5f3fc] md:h-dvh">
      <style>{`@keyframes bfy-drift{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-14px) rotate(calc(var(--r) + 14deg))}}`}</style>

      {/* background */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-3xl" aria-hidden />
      <Peony className="pointer-events-none absolute -left-24 -top-24 w-[240px] -rotate-12 opacity-80 sm:-left-28 sm:-top-28 sm:w-[380px]" />
      <Peony className="pointer-events-none absolute -bottom-24 -right-28 w-[260px] rotate-12 sm:-bottom-32 sm:-right-32 sm:w-[460px]" />
      {PETALS.map((p, i) => (
        <Petal key={i} style={{ left: p.l, top: p.t, width: 20 * p.s, ["--r" as any]: `${p.r}deg`, animation: `bfy-drift ${7 + (i % 3)}s ease-in-out ${p.d}s infinite` }} />
      ))}

      <MusicPlayer src="/music/bouquet.mp3" tone="cyan" />

      {/* top bar */}
      <div className="absolute left-0 top-0 z-20 px-6 py-5 sm:px-10">
        <Link href="/home" className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-4 py-2 text-sm text-cyan-700 shadow-sm backdrop-blur transition hover:bg-white hover:shadow-md active:scale-95">
          <ArrowLeft size={15} aria-hidden /> Back to Home
        </Link>
      </div>

      <main className="relative z-10 mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col items-center justify-center gap-[3vh] px-6 py-16 text-center md:py-6">
        {/* Bouquet, centered (no box): flowers + wrap + ribbon + every accessory that was chosen */}
        <div className="bloom h-[clamp(260px,62vh,560px)] drop-shadow-[0_22px_26px_rgba(8,145,178,0.35)]">
          <BouquetDisplay bouquet={b} layout="beside" size={300} />
        </div>

        {/* Letter button → opens the note modal */}
        <div className="rise" style={{ animationDelay: ".9s" }}>
          <LetterModal greeting={greeting} message={b.gift_message ?? ""} dedication={b.dedication} title={b.title} />
        </div>
      </main>
    </div>
  );
}