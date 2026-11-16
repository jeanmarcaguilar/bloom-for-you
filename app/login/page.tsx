import LoginForm from "./login-form";
import { Flower2, Heart } from "lucide-react";

const display = { className: "font-playfair" };
const script = { className: "font-vibes" };

export const metadata = { title: "Welcome · Bloom for You" };

/* ---------- helpers ---------- */

// deterministic pseudo-random so server & client render identically
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// a single peony-style petal pointing up from (0,0): wide shoulders, slightly ruffled tip
const petalPath = (L: number, W: number) =>
  `M0 0C${-W * 0.95} ${-L * 0.2} ${-W * 1.2} ${-L * 0.76} ${-W * 0.5} ${-L * 0.96}` +
  `Q${-W * 0.28} ${-L * 1.03} ${-W * 0.1} ${-L * 0.97}Q0 ${-L * 0.94} ${W * 0.1} ${-L * 0.97}` +
  `Q${W * 0.28} ${-L * 1.03} ${W * 0.5} ${-L * 0.96}C${W * 1.2} ${-L * 0.76} ${W * 0.95} ${-L * 0.2} 0 0Z`;

type Ring = { n: number; L: number; W: number; off: number; g: string; push: number };

const RINGS: Ring[] = [
  { n: 11, L: 182, W: 64, off: 0, g: "o", push: 8 },
  { n: 10, L: 156, W: 58, off: 14, g: "m", push: 6 },
  { n: 9, L: 128, W: 52, off: 7, g: "i", push: 5 },
  { n: 8, L: 100, W: 44, off: 21, g: "d", push: 4 },
  { n: 7, L: 72, W: 36, off: 3, g: "c", push: 2 },
];

/* ---------- realistic layered flower ---------- */

function Flower({ id, className = "", dew = true }: { id: string; className?: string; dew?: boolean }) {
  const p = (s: string) => `${id}-${s}`;
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden>
      <defs>
        {/* petal body: dark at the base, glassy pale at the edge */}
        {[
          ["o", "#0e8aa3", "#67d9ea", "#f0fdff"],
          ["m", "#0a7690", "#4fd1e6", "#d9fbff"],
          ["i", "#085f78", "#34c3dc", "#b8f3fb"],
          ["d", "#064e66", "#22b5d1", "#8eebf7"],
          ["c", "#053d52", "#1aa3c0", "#6fe3f2"],
        ].map(([k, a, b, c]) => (
          <linearGradient key={k} id={p(`g${k}`)} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={a} />
            <stop offset=".45" stopColor={b} />
            <stop offset="1" stopColor={c} />
          </linearGradient>
        ))}
        {/* soft light catching the middle of each petal */}
        <radialGradient id={p("hl")} cx="50%" cy="38%" r="55%">
          <stop offset="0" stopColor="#fff" stopOpacity=".6" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={p("dew")} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset=".5" stopColor="#bff3fb" stopOpacity=".35" />
          <stop offset="1" stopColor="#0e7490" stopOpacity=".45" />
        </radialGradient>
        <radialGradient id={p("core")}>
          <stop offset="0" stopColor="#fefce8" />
          <stop offset=".6" stopColor="#a5f3fc" />
          <stop offset="1" stopColor="#0891b2" />
        </radialGradient>
        {/* wobbles the petal edges so they look hand-grown, then adds a soft shadow */}
        <filter id={p("sh")} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="2" seed="7" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="9" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feDropShadow in="d" dx="0" dy="4" stdDeviation="5" floodColor="#042f3d" floodOpacity=".4" />
        </filter>
        <filter id={p("soft")}><feGaussianBlur stdDeviation=".7" /></filter>
      </defs>

      {RINGS.map((r, ri) => (
        <g key={ri} filter={`url(#${p("sh")})`}>
          {Array.from({ length: r.n }, (_, i) => {
            const s = ri * 31 + i;
            const a = r.off + (360 / r.n) * i + (rnd(s) - 0.5) * 9;
            const L = r.L * (0.93 + rnd(s + 7) * 0.14);
            const W = r.W * (0.9 + rnd(s + 13) * 0.2);
            const d = petalPath(L, W);
            return (
              <g key={i} transform={`translate(200 200) rotate(${a}) translate(0 ${-r.push}) skewX(${(rnd(s + 3) - 0.5) * 14})`}>
                <path d={d} fill={`url(#${p(`g${r.g}`)})`} stroke="#fff" strokeOpacity=".38" strokeWidth="1.2" />
                <path d={d} fill={`url(#${p("hl")})`} />
                {/* veins */}
                <g fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth=".9" strokeLinecap="round">
                  <path d={`M0 ${-L * 0.06}L0 ${-L * 0.82}`} />
                  <path d={`M0 ${-L * 0.1}Q${-W * 0.3} ${-L * 0.45} ${-W * 0.55} ${-L * 0.8}`} />
                  <path d={`M0 ${-L * 0.1}Q${W * 0.3} ${-L * 0.45} ${W * 0.55} ${-L * 0.8}`} />
                  <path d={`M0 ${-L * 0.1}Q${-W * 0.15} ${-L * 0.5} ${-W * 0.22} ${-L * 0.88}`} strokeOpacity=".16" />
                  <path d={`M0 ${-L * 0.1}Q${W * 0.15} ${-L * 0.5} ${W * 0.22} ${-L * 0.88}`} strokeOpacity=".16" />
                </g>
                {/* darker crease at the base gives depth */}
                <path d={petalPath(L * 0.35, W * 0.5)} fill="#032a38" opacity=".22" filter={`url(#${p("soft")})`} />
                {/* thin glossy rim where light hits the curled tip */}
                <path d={`M${-W * 0.6} ${-L * 0.9}Q0 ${-L * 1.07} ${W * 0.6} ${-L * 0.9}`} fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="2.2" strokeLinecap="round" filter={`url(#${p("soft")})`} />
              </g>
            );
          })}
        </g>
      ))}

      {/* stamens */}
      <g transform="translate(200 200)">
        <circle r="20" fill={`url(#${p("core")})`} />
        {Array.from({ length: 34 }, (_, i) => {
          const a = (360 / 34) * i + rnd(i) * 8;
          const l = 14 + rnd(i + 3) * 16;
          return (
            <g key={i} transform={`rotate(${a})`}>
              <line x1="0" y1="-6" x2="0" y2={-l} stroke="#ecfeff" strokeOpacity=".8" strokeWidth="1.1" />
              <circle cy={-l} r="1.9" fill="#fef9c3" />
            </g>
          );
        })}
      </g>

      {/* dew drops */}
      {dew && (
        <g>
          {[
            [118, 92, 7],
            [284, 120, 5.5],
            [96, 238, 5],
            [250, 306, 6.5],
            [310, 214, 4.5],
          ].map(([x, y, r], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y + r * 0.9} rx={r * 0.95} ry={r * 0.4} fill="#032a38" opacity=".3" />
              <circle cx={x} cy={y} r={r} fill={`url(#${p("dew")})`} stroke="#fff" strokeOpacity=".7" strokeWidth=".8" />
              <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.22} fill="#fff" />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

/* ---------- leaf ---------- */

function Leaf({ id, className = "", style }: { id: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="-60 -190 120 200" className={`pointer-events-none absolute ${className}`} style={style} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0.4" y2="0">
          <stop offset="0" stopColor="#064e5f" />
          <stop offset=".55" stopColor="#0e8fa6" />
          <stop offset="1" stopColor="#5ee0ee" />
        </linearGradient>
        <filter id={`${id}s`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#042f3d" floodOpacity=".35" />
        </filter>
      </defs>
      <g filter={`url(#${id}s)`}>
        <path d="M0 0C42 -38 46 -120 0 -184 -46 -120 -42 -38 0 0Z" fill={`url(#${id})`} />
        <g fill="none" stroke="#e0fbff" strokeOpacity=".38" strokeLinecap="round">
          <path d="M0 -4L0 -170" strokeWidth="1.6" />
          {[30, 58, 86, 114, 142].map((y) => (
            <g key={y} strokeWidth=".9">
              <path d={`M0 ${-y}Q-16 ${-y - 10} -28 ${-y - 24}`} />
              <path d={`M0 ${-y}Q16 ${-y - 10} 28 ${-y - 24}`} />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}

/* ---------- drifting petal ---------- */

function Petal({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="-24 -44 48 48" className={`pointer-events-none absolute ${className}`} style={style} aria-hidden>
      <defs>
        <linearGradient id="ptl" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#0e8aa3" />
          <stop offset=".6" stopColor="#8eeaf6" />
          <stop offset="1" stopColor="#f0fdff" />
        </linearGradient>
      </defs>
      <g style={{ filter: "drop-shadow(0 3px 3px rgba(4,47,61,.3))" }}>
        <path d={petalPath(40, 18)} fill="url(#ptl)" stroke="#fff" strokeOpacity=".5" strokeWidth=".6" />
        <path d="M0 -3L0 -32" stroke="#fff" strokeOpacity=".4" strokeWidth=".6" />
      </g>
    </svg>
  );
}

function Sparkle({ className = "", size = 18 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`pointer-events-none absolute text-white/90 drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] ${className}`} aria-hidden>
      <path d="M12 0C12.8 7 17 11.2 24 12 17 12.8 12.8 17 12 24 11.2 17 7 12.8 0 12 7 11.2 11.2 7 12 0Z" fill="currentColor" />
    </svg>
  );
}

const PETALS: { l: string; t: string; r: number; s: number; d: number }[] = [
  { l: "22%", t: "14%", r: -40, s: 1.2, d: 0 },
  { l: "9%", t: "46%", r: 70, s: 1, d: 1.5 },
  { l: "16%", t: "82%", r: 120, s: 1.1, d: 2 },
  { l: "86%", t: "20%", r: 50, s: 1.4, d: 1 },
  { l: "80%", t: "52%", r: -70, s: 0.9, d: 2.5 },
  { l: "70%", t: "84%", r: -30, s: 1, d: 3.5 },
];

// soft out-of-focus light circles (bokeh)
const BOKEH: { l: string; t: string; s: number; o: number }[] = [
  { l: "30%", t: "10%", s: 90, o: 0.45 },
  { l: "62%", t: "6%", s: 60, o: 0.4 },
  { l: "46%", t: "88%", s: 110, o: 0.4 },
  { l: "6%", t: "58%", s: 70, o: 0.35 },
  { l: "92%", t: "70%", s: 80, o: 0.4 },
  { l: "74%", t: "30%", s: 46, o: 0.5 },
  { l: "24%", t: "72%", s: 54, o: 0.4 },
];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.6'/%3E%3C/svg%3E\")";

/* ---------- page ---------- */

export default function LoginPage() {
  const divider = (
    <div className="mx-auto flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-20 bg-gradient-to-r from-transparent to-cyan-600/50" />
      <Heart size={18} className="fill-cyan-600 text-cyan-600 drop-shadow" />
      <span className="h-px w-20 bg-gradient-to-l from-transparent to-cyan-600/50" />
    </div>
  );

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-[#f0fdff] via-[#9eeaf5] to-[#3fb8cf] px-6 py-10">
      <style>{`
        @keyframes bfy-drift{0%,100%{transform:translate(0,0) rotate(var(--r))}50%{transform:translate(10px,-16px) rotate(calc(var(--r) + 16deg))}}
        @keyframes bfy-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
        @media (prefers-reduced-motion: reduce){.bfy-anim{animation:none!important}}
      `}</style>

      {/* atmosphere: sun glow from top-left, deep teal falloff bottom-right */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[70vh] w-[70vh] rounded-full bg-white/70 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[70vh] w-[70vh] rounded-full bg-cyan-800/40 blur-3xl" aria-hidden />
      <div
        className="pointer-events-none absolute -top-20 left-[10%] hidden h-[140%] w-40 -rotate-[24deg] bg-gradient-to-b from-white/50 via-white/10 to-transparent blur-2xl sm:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-20 left-[26%] hidden h-[140%] w-24 -rotate-[24deg] bg-gradient-to-b from-white/35 via-white/5 to-transparent blur-2xl sm:block"
        aria-hidden
      />

      {/* bokeh */}
      {BOKEH.map((b, i) => (
        <span
          key={i}
          className="pointer-events-none absolute rounded-full bg-white blur-[6px]"
          style={{ left: b.l, top: b.t, width: b.s, height: b.s, opacity: b.o * 0.6 }}
          aria-hidden
        />
      ))}

      {/* far background flower — heavily out of focus for depth */}
      <Flower id="fb" dew={false} className="pointer-events-none absolute -right-24 top-[6%] hidden w-[320px] rotate-[30deg] opacity-45 blur-[7px] sm:block" />
      <Flower id="fc" dew={false} className="pointer-events-none absolute -left-20 bottom-[8%] hidden w-[260px] -rotate-[20deg] opacity-40 blur-[8px] sm:block" />

      {/* leaves behind the main blooms */}
      <Leaf id="lf1" className="-bottom-10 right-[10%] hidden w-[130px] rotate-[200deg] blur-[1px] sm:block" />
      <Leaf id="lf2" className="-bottom-6 -right-6 w-[110px] rotate-[235deg] sm:w-[170px]" />
      <Leaf id="lf3" className="-left-6 top-[12%] hidden w-[120px] rotate-[110deg] sm:block" />
      <Leaf id="lf4" className="-left-8 -top-6 w-[90px] rotate-[140deg] sm:hidden" />
      <Leaf id="lf5" className="right-[22%] -bottom-12 hidden w-[110px] rotate-[165deg] blur-[3px] sm:block" />

      {/* hero blooms */}
      <div className="bfy-anim pointer-events-none absolute -left-24 -top-24 w-[260px] -rotate-12 sm:-left-32 sm:-top-32 sm:w-[460px]" style={{ animation: "bfy-breathe 9s ease-in-out infinite" }}>
        <Flower id="fa" className="w-full drop-shadow-[0_24px_30px_rgba(4,47,61,0.35)]" />
      </div>
      <div className="bfy-anim pointer-events-none absolute -bottom-28 -right-28 w-[280px] rotate-12 sm:-bottom-40 sm:-right-36 sm:w-[520px]" style={{ animation: "bfy-breathe 11s ease-in-out 1s infinite" }}>
        <Flower id="fd" className="w-full drop-shadow-[0_24px_30px_rgba(4,47,61,0.4)]" />
      </div>

      {/* petals + sparkles */}
      {PETALS.map((p, i) => (
        <Petal
          key={i}
          className="bfy-anim hidden sm:block"
          style={{
            left: p.l,
            top: p.t,
            width: 26 * p.s,
            ["--r" as any]: `${p.r}deg`,
            animation: `bfy-drift ${8 + (i % 3)}s ease-in-out ${p.d}s infinite`,
          }}
        />
      ))}
      <Sparkle className="left-[24%] top-[30%] hidden sm:block" size={24} />
      <Sparkle className="left-[12%] top-[64%] hidden sm:block" size={16} />
      <Sparkle className="right-[22%] top-[14%] hidden sm:block" size={16} />
      <Sparkle className="right-[10%] top-[58%] hidden sm:block" size={13} />

      {/* dappled light, as if sun is passing through leaves */}
      {[
        ["38%", "-6%", 220, 90, -28],
        ["58%", "70%", 260, 80, 22],
        ["8%", "30%", 150, 60, 40],
        ["78%", "8%", 180, 70, -10],
      ].map(([l, t, w, h, r], i) => (
        <span
          key={i}
          className="pointer-events-none absolute hidden rounded-[50%] bg-white/35 blur-2xl sm:block"
          style={{ left: l as string, top: t as string, width: w as number, height: h as number, transform: `rotate(${r}deg)` }}
          aria-hidden
        />
      ))}

      {/* floating pollen / dust catching the light */}
      {Array.from({ length: 22 }, (_, i) => (
        <span
          key={i}
          className="bfy-anim pointer-events-none absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]"
          style={{
            left: `${rnd(i + 40) * 100}%`,
            top: `${rnd(i + 80) * 100}%`,
            width: 2 + rnd(i + 5) * 4,
            height: 2 + rnd(i + 5) * 4,
            opacity: 0.35 + rnd(i + 9) * 0.5,
            ["--r" as any]: "0deg",
            animation: `bfy-drift ${9 + (i % 5)}s ease-in-out ${(i % 7) * 0.6}s infinite`,
          }}
          aria-hidden
        />
      ))}

      {/* film grain + vignette for a photographic feel */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay" style={{ backgroundImage: GRAIN }} aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(4,47,61,0.28)_100%)]" aria-hidden />

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

        <p className={`${display.className} mt-6 text-sm italic text-cyan-900/90`}>
          Made with love, one little memory at a time. <Heart size={13} className="ml-1 inline text-cyan-700" aria-hidden />
        </p>
      </main>
    </div>
  );
}