import LoginForm from "./login-form";
import { Flower2 } from "lucide-react";

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
          ["o", "#3fb9d3", "#a5e9f4", "#f4feff"],
          ["m", "#33b0cc", "#92e3f1", "#e6fcff"],
          ["i", "#27a5c2", "#7fdced", "#d3f8fd"],
          ["d", "#1d98b8", "#6cd4e8", "#bff3fa"],
          ["c", "#188bac", "#5ccbe2", "#a9edf7"],
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
          <stop offset="1" stopColor="#3bb7d0" />
        </radialGradient>
        {/* wobbles the petal edges so they look hand-grown, then adds a soft shadow */}
        <filter id={p("sh")} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="2" seed="7" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="9" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feDropShadow in="d" dx="0" dy="4" stdDeviation="5" floodColor="#0b6f8a" floodOpacity=".22" />
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
                <path d={petalPath(L * 0.35, W * 0.5)} fill="#0a6f8a" opacity=".16" filter={`url(#${p("soft")})`} />
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
              <ellipse cx={x} cy={y + r * 0.9} rx={r * 0.95} ry={r * 0.4} fill="#0a6f8a" opacity=".2" />
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
          <stop offset="0" stopColor="#1a97b2" />
          <stop offset=".55" stopColor="#52cfe3" />
          <stop offset="1" stopColor="#b4f2fa" />
        </linearGradient>
        <filter id={`${id}s`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0b6f8a" floodOpacity=".22" />
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

const TONES = {
  teal: ["#1790ad", "#3fc3dc", "#a8eef8"],
  pale: ["#6fd0e4", "#c4f3fa", "#ffffff"],
};

function Petal({ className = "", style, tone = "teal" }: { className?: string; style?: React.CSSProperties; tone?: "teal" | "pale" }) {
  const [a, b, c] = TONES[tone];
  const id = `ptl-${tone}`;
  return (
    <svg viewBox="-24 -44 48 48" className={`pointer-events-none absolute ${className}`} style={style} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={a} />
          <stop offset=".6" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
      </defs>
      <g style={{ filter: "drop-shadow(0 3px 3px rgba(11,111,138,.22))" }}>
        <path d={petalPath(40, 18)} fill={`url(#${id})`} stroke="#fff" strokeOpacity=".6" strokeWidth=".6" />
        <path d="M0 -3L0 -32" stroke="#fff" strokeOpacity=".45" strokeWidth=".6" />
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

const PETALS: { l: string; t: string; r: number; w: number; d: number; tone: "teal" | "pale" }[] = [
  { l: "26%", t: "40%", r: -25, w: 56, d: 0, tone: "pale" },
  { l: "22%", t: "67%", r: 25, w: 110, d: 1.5, tone: "teal" },
  { l: "75%", t: "41%", r: -35, w: 80, d: 1, tone: "pale" },
  { l: "88%", t: "16%", r: 40, w: 90, d: 2, tone: "teal" },
  { l: "68%", t: "88%", r: -15, w: 70, d: 3, tone: "pale" },
  { l: "30%", t: "8%", r: 60, w: 44, d: 2.5, tone: "pale" },
];

// water droplets floating in the air
const BUBBLES: { l: string; t: string; s: number }[] = [
  { l: "66%", t: "18%", s: 36 },
  { l: "15%", t: "50%", s: 24 },
  { l: "31%", t: "18%", s: 28 },
];

// soft out-of-focus light circles (bokeh)
const BOKEH: { l: string; t: string; s: number; o: number }[] = [
  { l: "30%", t: "10%", s: 90, o: 0.45 },
  { l: "62%", t: "6%", s: 60, o: 0.4 },
  { l: "6%", t: "58%", s: 70, o: 0.35 },
  { l: "74%", t: "30%", s: 46, o: 0.5 },
];

/* ---------- water at the foot of the page ---------- */

function Water() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[16vh] min-h-[90px]" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/25 to-[#8fe0ee]/70" />
      <span className="absolute left-[20%] top-[40%] h-6 w-[30%] rounded-full bg-white/40 blur-2xl" />
      <span className="absolute right-[18%] top-[30%] h-8 w-[22%] rounded-full bg-white/40 blur-2xl" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 100" preserveAspectRatio="none" fill="none" stroke="#fff">
        <ellipse cx="700" cy="52" rx="90" ry="7" strokeOpacity=".55" vectorEffect="non-scaling-stroke" />
        <ellipse cx="700" cy="52" rx="140" ry="11" strokeOpacity=".3" vectorEffect="non-scaling-stroke" />
        <ellipse cx="860" cy="72" rx="110" ry="8" strokeOpacity=".4" vectorEffect="non-scaling-stroke" />
        <path d="M60 30H330M120 58H460M520 80H820M380 44H600" strokeOpacity=".35" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/* ---------- page ---------- */

export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-b from-[#d9f7fc] via-[#a3e8f3] to-[#74d0e4] px-5 py-10">
      <style>{`
        @keyframes bfy-drift{0%,100%{transform:translate(0,0) rotate(var(--r))}50%{transform:translate(10px,-16px) rotate(calc(var(--r) + 16deg))}}
        @keyframes bfy-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}
        @media (prefers-reduced-motion: reduce){.bfy-anim{animation:none!important}}
      `}</style>

      {/* airy light: bright centre, soft glow top-left, cooler corner bottom-right */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(255,255,255,0.75),transparent_62%)]" aria-hidden />
      <div className="pointer-events-none absolute -left-32 -top-32 h-[60vh] w-[60vh] rounded-full bg-white/60 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[60vh] w-[60vh] rounded-full bg-cyan-500/25 blur-3xl" aria-hidden />

      {/* big glass ring behind the content */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/55 shadow-[0_0_40px_rgba(255,255,255,0.35),inset_0_0_50px_rgba(255,255,255,0.3)] sm:block"
        style={{ width: "min(74vw, 1300px)", height: "min(106vh, 980px)" }}
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

      {/* out-of-focus blooms for depth */}
      <Flower id="fb" dew={false} className="pointer-events-none absolute -right-[3vw] top-[18%] hidden w-[26vw] rotate-[30deg] opacity-40 blur-[10px] sm:block" />
      <Flower id="fc" dew={false} className="pointer-events-none absolute -bottom-[3vw] -left-[3vw] hidden w-[clamp(280px,24vw,480px)] -rotate-[20deg] opacity-[0.85] blur-[2px] sm:block" />

      <Water />

      {/* leaves tucked behind the main blooms */}
      <Leaf id="lf1" className="bottom-[14%] right-[18%] hidden w-[120px] rotate-[40deg] sm:block" />
      <Leaf id="lf2" className="-bottom-6 -right-6 w-[110px] rotate-[235deg] sm:w-[170px]" />
      <Leaf id="lf3" className="left-[22%] top-[3%] hidden w-[110px] rotate-[95deg] sm:block" />
      <Leaf id="lf4" className="-left-8 -top-6 w-[90px] rotate-[140deg] sm:hidden" />
      <Leaf id="lf5" className="bottom-[8%] left-[20%] hidden w-[110px] rotate-[20deg] blur-[1px] sm:block" />

      {/* hero blooms */}
      <div className="bfy-anim pointer-events-none absolute -left-24 -top-24 w-[260px] sm:-left-[2vw] sm:-top-[7vw] sm:w-[clamp(340px,27vw,560px)]" style={{ animation: "bfy-breathe 9s ease-in-out infinite" }}>
        <Flower id="fa" className="w-full -rotate-12 drop-shadow-[0_24px_30px_rgba(11,111,138,0.22)]" />
      </div>
      <div className="bfy-anim pointer-events-none absolute -bottom-28 -right-28 w-[280px] sm:-bottom-[2vw] sm:-right-[5vw] sm:w-[clamp(380px,31vw,640px)]" style={{ animation: "bfy-breathe 11s ease-in-out 1s infinite" }}>
        <Flower id="fd" className="w-full rotate-12 drop-shadow-[0_24px_30px_rgba(11,111,138,0.25)]" />
      </div>

      {/* drifting petals, droplets and glints */}
      {PETALS.map((p, i) => (
        <Petal
          key={i}
          tone={p.tone}
          className="bfy-anim hidden sm:block"
          style={{
            left: p.l,
            top: p.t,
            width: p.w,
            ["--r" as any]: `${p.r}deg`,
            animation: `bfy-drift ${8 + (i % 3)}s ease-in-out ${p.d}s infinite`,
          }}
        />
      ))}
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="pointer-events-none absolute hidden rounded-full bg-gradient-to-br from-white/80 to-cyan-200/20 shadow-[inset_0_-2px_4px_rgba(11,111,138,0.18)] ring-1 ring-white/80 sm:block"
          style={{ left: b.l, top: b.t, width: b.s, height: b.s }}
          aria-hidden
        />
      ))}
      <Sparkle className="left-[22%] top-[47%] hidden sm:block" size={14} />
      <Sparkle className="right-[25%] top-[12%] hidden sm:block" size={16} />
      <Sparkle className="right-[11%] top-[42%] hidden sm:block" size={13} />
      <Sparkle className="left-[55%] bottom-[10%] hidden sm:block" size={12} />

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

      <main className="relative z-10 w-full max-w-3xl text-center">
        {/* logo medallion between two fading lines */}
        <div className="mx-auto flex items-center justify-center gap-4 sm:gap-5" aria-hidden>
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-white sm:w-36" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[#0c7a92] shadow-[0_8px_24px_-6px_rgba(8,110,140,0.5)] sm:h-16 sm:w-16">
            <span className="absolute -inset-2 rounded-full ring-1 ring-white/80" />
            <Flower2 size={28} />
          </span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-white sm:w-36" />
        </div>

        <p className="mt-4 pl-[0.4em] text-xs font-medium uppercase tracking-[0.4em] text-[#0b6b82] sm:text-sm">Bloom for You</p>

        <h1 className="mt-3">
          <span className={`${display.className} block text-3xl font-bold leading-tight text-[#0a6379] sm:text-[2.6rem]`}>A Little World</span>
          <span className={`${script.className} -mt-1 block whitespace-nowrap text-[length:calc((100vw-2.5rem)/7.4)] leading-[1.05] text-[#0c7a92] sm:-mt-2 sm:text-7xl lg:text-[5.5rem]`}>Made Just for You</span>
        </h1>

        {/* swoosh underline with a heart */}
        <svg viewBox="0 0 480 24" className="mx-auto mt-1 h-6 w-[min(30rem,92%)]" aria-hidden>
          <defs>
            <linearGradient id="swl" x1="0" x2="1">
              <stop offset="0" stopColor="#0c7a92" stopOpacity="0" />
              <stop offset="1" stopColor="#0c7a92" stopOpacity=".8" />
            </linearGradient>
            <linearGradient id="swr" x1="1" x2="0">
              <stop offset="0" stopColor="#0c7a92" stopOpacity="0" />
              <stop offset="1" stopColor="#0c7a92" stopOpacity=".8" />
            </linearGradient>
          </defs>
          <path d="M10 12C90 4 170 6 220 14" fill="none" stroke="url(#swl)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M470 12C390 4 310 6 260 14" fill="none" stroke="url(#swr)" strokeWidth="1.5" strokeLinecap="round" />
          <path
            transform="translate(229.8 1) scale(.85)"
            fill="#0c7a92"
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        </svg>

        <p className="mx-auto mt-3 max-w-[22rem] text-sm leading-relaxed tracking-wide text-[#0b6b82]/85 sm:text-[0.95rem]">
          A place for our memories, little surprises, and things I want you to know.
        </p>

        <LoginForm />
      </main>
    </div>
  );
}