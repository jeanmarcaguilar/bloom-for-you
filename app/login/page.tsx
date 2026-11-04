import LoginForm from "./login-form";
import { Flower2, Heart } from "lucide-react";


const display = { className: "font-playfair" };
const script = { className: "font-vibes" };

export const metadata = { title: "Welcome · Bloom for You" };

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
    <svg width={size} height={size} viewBox="0 0 24 24" className={`pointer-events-none absolute text-cyan-600/70 ${className}`} aria-hidden>
      <path d="M12 0C12.8 7 17 11.2 24 12 17 12.8 12.8 17 12 24 11.2 17 7 12.8 0 12 7 11.2 11.2 7 12 0Z" fill="currentColor" />
    </svg>
  );
}

const PETALS: { l: string; t: string; r: number; s: number; d: number }[] = [
  { l: "18%", t: "16%", r: -40, s: 1.3, d: 0 }, { l: "8%", t: "42%", r: 70, s: 1.1, d: 1.5 },
  { l: "14%", t: "78%", r: 120, s: 1.2, d: 2 }, { l: "88%", t: "22%", r: 50, s: 1.5, d: 1 },
  { l: "82%", t: "48%", r: -70, s: 1, d: 2.5 }, { l: "78%", t: "80%", r: -30, s: 0.9, d: 3.5 },
];

export default function LoginPage() {
  const divider = (
    <div className="mx-auto flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-20 bg-gradient-to-r from-transparent to-cyan-600/50" />
      <Heart size={18} className="fill-cyan-600 text-cyan-600 drop-shadow" />
      <span className="h-px w-20 bg-gradient-to-l from-transparent to-cyan-600/50" />
    </div>
  );

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-[#ecfeff] via-[#a5f3fc] to-[#67e8f9] px-6 py-10">
      <style>{`@keyframes bfy-drift{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-14px) rotate(calc(var(--r) + 14deg))}}`}</style>

      {/* soft haze */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-200/60 blur-3xl" aria-hidden />

      {/* peonies */}
      <Peony className="pointer-events-none absolute -left-24 -top-24 w-[240px] -rotate-12 opacity-80 sm:-left-28 sm:-top-28 sm:w-[400px]" />
      <Peony className="pointer-events-none absolute -right-28 top-[30%] hidden w-[300px] rotate-45 opacity-40 blur-[2px] sm:block" />
      <Peony className="pointer-events-none absolute -bottom-24 -right-28 w-[260px] rotate-12 sm:-bottom-32 sm:-right-32 sm:w-[460px]" />

      {/* petals + sparkles */}
      {PETALS.map((p, i) => (
        <Petal key={i} className="hidden sm:block" style={{ left: p.l, top: p.t, width: 20 * p.s, ["--r" as any]: `${p.r}deg`, animation: `bfy-drift ${7 + (i % 3)}s ease-in-out ${p.d}s infinite` }} />
      ))}
      <Sparkle className="left-[22%] top-[30%] hidden sm:block" size={26} />
      <Sparkle className="left-[12%] top-[66%] hidden sm:block" size={18} />
      <Sparkle className="right-[20%] top-[14%] hidden sm:block" size={16} />
      <Sparkle className="right-[8%] top-[60%] hidden sm:block" size={14} />

      <main className="relative z-10 w-full max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/80 text-cyan-700 shadow-md ring-1 ring-white">
          <Flower2 size={28} aria-hidden />
        </span>

        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-cyan-900/70">Bloom for You</p>
        <h1 className="mt-3">
          <span className={`${display.className} block text-3xl font-bold leading-tight tracking-wide text-cyan-950 sm:text-4xl`}>A Little World</span>
          <span className={`${script.className} block text-5xl leading-[1.05] text-cyan-700 drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)] sm:text-6xl`}>Made Just for You</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm text-cyan-950/70">A place for our memories, little surprises, and things I want you to know.</p>
        <div className="mt-4">{divider}</div>

        <LoginForm />

        <p className={`${display.className} mt-6 text-sm italic text-cyan-800/80`}>Made with love, one little memory at a time. <Heart size={13} className="ml-1 inline text-cyan-700" aria-hidden /></p>
      </main>
    </div>
  );
}