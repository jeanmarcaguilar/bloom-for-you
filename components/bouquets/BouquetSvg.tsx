import { memo } from "react";
import { WRAPS, RIBBONS, PEONY_DESIGNS, parseAccessories } from "@/lib/bouquet";

const safeHex = (h: string | undefined, fallback = "#F48CA5") => {
  if (!h || typeof h !== "string" || !h.startsWith("#") || h.length < 7) return fallback;
  return h;
};
const hx = (h: string) => {
  const clean = safeHex(h);
  return [1, 3, 5].map((i) => parseInt(clean.slice(i, i + 2), 16) || 0);
};
export const mix = (h: string, o: string, t: number) => {
  const a = hx(h), b = hx(o);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
};

/** Short stable key from the props that change the drawing. Every gradient id gets it, so two bouquets
 *  on the same page (home, dashboard, lists) can never "borrow" each other's colors. */
const instanceKey = (...parts: (string | number)[]) => {
  let h = 5381;
  for (const ch of parts.join("|")) h = ((h << 5) + h + ch.charCodeAt(0)) | 0;
  return Math.abs(h).toString(36);
};

const r4 = (n: number) => parseFloat(n.toFixed(4));
const r2 = (n: number) => parseFloat(n.toFixed(2));

/* ══════════════════════════════════════════════════════════════
   PEONY HEAD — 32 DISTINCT PROCEDURAL DESIGNS (0 to 31)
   • 4 Style Archetypes × 8 Variations:
     0, 4, 8, 12, 16, 20, 24, 28: Double Bomb / Sarah Bernhardt
     1, 5, 9, 13, 17, 21, 25, 29: Imperial / Japanese (Bowl of Beauty)
     2, 6, 10, 14, 18, 22, 26, 30: Semi-Double (Coral Sunset)
     3, 7, 11, 15, 19, 23, 27, 31: Rose-Form Spiral (Duchesse de Nemours)
══════════════════════════════════════════════════════════════ */
function PeonyHead({ c, uid, designIndex }: { c: string; uid: string; designIndex: number }) {
  const d3 = mix(c, "#000000", 0.46);
  const d  = mix(c, "#000000", 0.28);
  const d2 = mix(c, "#000000", 0.14);
  const l  = mix(c, "#FFFFFF", 0.35);
  const l2 = mix(c, "#FFFFFF", 0.58);
  const ll = mix(c, "#FFFFFF", 0.82);
  const gold = "#F6C543", goldD = "#C58D14", goldL = "#FFF8D6";
  const p = `${uid}_d${designIndex}`;

  const archetype = designIndex % 4;
  const variation = Math.floor(designIndex / 4) % 8;

  /* Common Defs for Depth Gradients */
  const defs = (
    <defs>
      <radialGradient id={`pnG1_${p}`} cx="40%" cy="35%" r="70%">
        <stop offset="0%" stopColor={ll} />
        <stop offset="45%" stopColor={c} />
        <stop offset="100%" stopColor={d} />
      </radialGradient>
      <radialGradient id={`pnG2_${p}`} cx="50%" cy="40%" r="65%">
        <stop offset="0%" stopColor={l} />
        <stop offset="55%" stopColor={c} />
        <stop offset="100%" stopColor={d3} />
      </radialGradient>
      <radialGradient id={`pnG3_${p}`} cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor={l2} />
        <stop offset="65%" stopColor={l} />
        <stop offset="100%" stopColor={c} />
      </radialGradient>
      <radialGradient id={`pnGold_${p}`} cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor={goldL} />
        <stop offset="50%" stopColor={gold} />
        <stop offset="100%" stopColor={goldD} />
      </radialGradient>
    </defs>
  );

  /* ── Archetype 0: Double Bomb Peony (Designs 0, 4, 8, 12, 16, 20, 24, 28) ── */
  if (archetype === 0) {
    const outerCount = 10 + (variation % 5);
    const midCount = 10 + ((variation * 3) % 6);
    const innerCount = 7 + (variation % 4);
    const outerR = 12 + (variation % 3) * 0.5;
    const waveW = 3.6 + (variation % 3) * 0.4;
    return (
      <g>
        {defs}
        {/* Tier 1: Outer ruffled guard petals */}
        {Array.from({ length: outerCount }).map((_, i) => {
          const a = (i / outerCount) * Math.PI * 2;
          const px = r4(outerR * 0.65 * Math.cos(a));
          const py = r4(outerR * 0.65 * Math.sin(a));
          const rot = r2((a * 180) / Math.PI + 90);
          return (
            <g key={`t1_${i}`} transform={`translate(${px} ${py}) rotate(${rot})`}>
              <path
                d={`M0 0 C-${waveW} -1.5 -${waveW + 1} -${outerR * 0.7} -${waveW * 0.5} -${outerR} C0 -${outerR + 2.5} ${waveW * 0.5} -${outerR} ${waveW + 1} -${outerR * 0.7} C${waveW} -1.5 0 0 0 0Z`}
                fill={`url(#pnG1_${p})`} stroke={d} strokeWidth="0.32" />
              <path
                d={`M-${waveW * 0.6} -${outerR * 0.9} Q0 -${outerR + 2} ${waveW * 0.6} -${outerR * 0.9}`}
                stroke={ll} strokeWidth="0.45" fill="none" opacity="0.65" />
            </g>
          );
        })}

        {/* Tier 2: Middle overlapping ruffled petals */}
        {Array.from({ length: midCount }).map((_, i) => {
          const a = (i / midCount) * Math.PI * 2 + 0.25;
          const px = r4(7.2 * Math.cos(a));
          const py = r4(7.2 * Math.sin(a));
          const rot = r2((a * 180) / Math.PI + 90);
          return (
            <g key={`t2_${i}`} transform={`translate(${px} ${py}) rotate(${rot})`}>
              <path
                d="M0 0 C-3 -1 -4 -6 -2 -9.5 C0 -11.5 2 -11.5 4 -9.5 C6 -6 3 -1 0 0Z"
                fill={`url(#pnG2_${p})`} stroke={d} strokeWidth="0.3" />
              <path d="M-1.5 -8.5 Q0 -10.5 2 -8.5" stroke={ll} strokeWidth="0.4" fill="none" opacity="0.6" />
            </g>
          );
        })}

        {/* Tier 3: Inner bomb pom-pom whorls */}
        {Array.from({ length: innerCount }).map((_, i) => {
          const a = (i / innerCount) * Math.PI * 2 + 0.5;
          const px = r4(4.0 * Math.cos(a));
          const py = r4(4.0 * Math.sin(a));
          const rot = r2((a * 180) / Math.PI + 90);
          return (
            <path key={`t3_${i}`} transform={`translate(${px} ${py}) rotate(${rot})`}
              d="M0 0 C-2.4 -0.6 -2.8 -4 -1.2 -6.5 C0 -7.8 1.6 -7.8 2.6 -6 C3.2 -4 2.2 -0.6 0 0Z"
              fill={`url(#pnG3_${p})`} stroke={d2} strokeWidth="0.25" />
          );
        })}

        {/* Core crinkled bud */}
        <ellipse rx={r4(2.4 + (variation % 3) * 0.3)} ry={r4(1.9 + (variation % 3) * 0.3)} fill={ll} opacity="0.8" />
        <path d="M-1.4 0 C-2 -1.5 -1.2 -3.5 0 -4 C1.2 -3.5 2 -1.5 1.4 0Z" fill={l2} stroke={d} strokeWidth="0.25" />
      </g>
    );
  }

  /* ── Archetype 1: Imperial / Japanese Peony (Designs 1, 5, 9, 13, 17, 21, 25, 29) ── */
  if (archetype === 1) {
    const guardCount = 8 + (variation % 3);
    const staminodeCount = 18 + (variation * 2);
    const saucerRadius = 14 + (variation % 3);
    return (
      <g>
        {defs}
        {/* Broad saucer guard petals */}
        {Array.from({ length: guardCount }).map((_, i) => {
          const a = (i / guardCount) * Math.PI * 2;
          const rot = r2((a * 180) / Math.PI + 90);
          return (
            <g key={`gp_${i}`} transform={`rotate(${rot})`}>
              <path
                d={`M0 2 C-7 0 -11 -6 -8 -13 C-5 -${saucerRadius + 2} 5 -${saucerRadius + 2} 8 -13 C11 -6 7 0 0 2Z`}
                fill={`url(#pnG1_${p})`} stroke={d} strokeWidth="0.38" />
              <path d={`M-5 -12 Q0 -${saucerRadius + 1} 5 -12`} stroke={ll} strokeWidth="0.45" fill="none" opacity="0.75" />
              {/* Radial midrib */}
              <line x1="0" y1="1" x2="0" y2={`-${saucerRadius - 1}`} stroke={d} strokeWidth="0.35" opacity="0.28" />
            </g>
          );
        })}

        {/* Secondary transition cup */}
        {Array.from({ length: 6 }).map((_, i) => (
          <path key={`tc_${i}`} transform={`rotate(${i * 60 + 30})`}
            d="M0 1 C-4.5 0 -6 -4.5 -4.5 -8.5 C0 -10.5 4.5 -8.5 4.5 -8.5 C6 -4.5 4.5 0 0 1Z"
            fill={`url(#pnG2_${p})`} stroke={d} strokeWidth="0.28" opacity="0.9" />
        ))}

        {/* Dense bursting golden staminodes in the center */}
        {Array.from({ length: staminodeCount }).map((_, i) => {
          const a = (i / staminodeCount) * Math.PI * 2;
          const len = r4(4.8 + ((i * 7) % 5) * 0.45);
          const ex = r4(len * Math.cos(a));
          const ey = r4(len * Math.sin(a));
          return (
            <g key={`st_${i}`}>
              <line x1="0" y1="0" x2={ex} y2={ey} stroke={goldD} strokeWidth="0.5" strokeLinecap="round" />
              <circle cx={ex} cy={ey} r="0.75" fill={`url(#pnGold_${p})`} />
              <circle cx={ex} cy={ey} r="0.35" fill="#FFFFFF" opacity="0.8" />
            </g>
          );
        })}

        {/* Central carpels with crimson stigma tips */}
        <circle r="1.6" fill={mix(c, "#5A8A28", 0.5)} stroke="#3A6A18" strokeWidth="0.3" />
        {[-40, 40, 180].map((deg, i) => (
          <ellipse key={i} cx={r4(0.9 * Math.cos(deg * (Math.PI / 180)))} cy={r4(0.9 * Math.sin(deg * (Math.PI / 180)))}
            rx="0.55" ry="0.4" fill="#E03058" />
        ))}
      </g>
    );
  }

  /* ── Archetype 2: Semi-Double Romantic Peony (Designs 2, 6, 10, 14, 18, 22, 26, 30) ── */
  if (archetype === 2) {
    const outerP = 11 + (variation % 4);
    const innerP = 8 + (variation % 3);
    const stamens = 14 + variation;
    return (
      <g>
        {defs}
        {/* Tier 1: Flowing undulating outer petals */}
        {Array.from({ length: outerP }).map((_, i) => {
          const a = (i / outerP) * Math.PI * 2;
          const rot = r2((a * 180) / Math.PI + 90);
          return (
            <g key={`sd1_${i}`} transform={`rotate(${rot})`}>
              <path
                d="M0 2 C-6 0.5 -10 -5 -7.5 -12.5 C-4.5 -17.5 4.5 -17.5 7.5 -12.5 C10 -5 6 0.5 0 2Z"
                fill={`url(#pnG1_${p})`} stroke={d} strokeWidth="0.35" />
              <path d="M-5 -11.5 Q0 -16.5 5 -11.5" stroke={ll} strokeWidth="0.42" fill="none" opacity="0.65" />
            </g>
          );
        })}

        {/* Tier 2: Fluted cupped intermediate petals */}
        {Array.from({ length: innerP }).map((_, i) => {
          const a = (i / innerP) * Math.PI * 2 + 0.35;
          const rot = r2((a * 180) / Math.PI + 90);
          return (
            <g key={`sd2_${i}`} transform={`rotate(${rot})`}>
              <path
                d="M0 1 C-4.5 0 -6.5 -4 -4.8 -9 C-2 -12 2 -12 4.8 -9 C6.5 -4 4.5 0 0 1Z"
                fill={`url(#pnG2_${p})`} stroke={d} strokeWidth="0.3" />
            </g>
          );
        })}

        {/* Center: Ring of delicate stamens + carpels */}
        {Array.from({ length: stamens }).map((_, i) => {
          const a = (i / stamens) * Math.PI * 2;
          const dist = r4(3.8 + (i % 3) * 0.4);
          const sx = r4(dist * Math.cos(a));
          const sy = r4(dist * Math.sin(a));
          return (
            <g key={`sd_st_${i}`}>
              <line x1="0" y1="0" x2={sx} y2={sy} stroke={goldD} strokeWidth="0.45" />
              <circle cx={sx} cy={sy} r="0.75" fill={`url(#pnGold_${p})`} />
            </g>
          );
        })}
        <circle r="1.5" fill="#6A9A38" stroke="#3A6A18" strokeWidth="0.35" />
        <circle r="0.75" fill="#E04060" />
      </g>
    );
  }

  /* ── Archetype 3: Rose-Form Spiral Peony (Designs 3, 7, 11, 15, 19, 23, 27, 31) ── */
  const dir = variation % 2 === 0 ? 1 : -1;
  const outerPls = 10 + (variation % 4);
  const midPls = 7 + (variation % 3);
  return (
    <g>
      {defs}
      {/* Outer reflexed petals */}
      {Array.from({ length: outerPls }).map((_, i) => {
        const a = (i / outerPls) * Math.PI * 2;
        const rot = r2((a * 180) / Math.PI + 90);
        return (
          <g key={`rf1_${i}`} transform={`rotate(${rot})`}>
            <path
              d="M0 2.5 C-7 1 -11 -5.5 -8.5 -13 C-5.5 -18.5 5.5 -18.5 8.5 -13 C11 -5.5 7 1 0 2.5Z"
              fill={`url(#pnG1_${p})`} stroke={d} strokeWidth="0.38" />
            <path d="M-6 -12 Q0 -17.5 6 -12" stroke={ll} strokeWidth="0.45" fill="none" opacity="0.7" />
          </g>
        );
      })}

      {/* Spiral middle tiers */}
      {Array.from({ length: midPls }).map((_, i) => {
        const rot = r2(i * (360 / midPls) * dir + 20);
        return (
          <g key={`rf2_${i}`} transform={`rotate(${rot})`}>
            <path
              d="M0 1.5 C-5 0.5 -7.5 -4.5 -5.5 -10 C-3 -13.5 3 -13.5 5.5 -10 C7.5 -4.5 5 0.5 0 1.5Z"
              fill={`url(#pnG2_${p})`} stroke={d} strokeWidth="0.32" />
          </g>
        );
      })}

      {/* Inner nested spiral whorl petals */}
      {[0, 72, 144, 216, 288].map((baseRot, i) => (
        <path key={`rf3_${i}`} transform={`rotate(${baseRot * dir})`}
          d="M0 1 C-3 0.2 -4.2 -3.2 -2.8 -6.5 C-1.2 -8.5 1.2 -8.5 2.8 -6.5 C4.2 -3.2 3 0.2 0 1Z"
          fill={`url(#pnG3_${p})`} stroke={d2} strokeWidth="0.25" />
      ))}

      {/* Central swirling bud */}
      <path d="M-1.5 0.5 C-2.5 -1.5 -1.8 -4.8 0 -5.2 C1.8 -4.8 2.5 -1.5 1.5 0.5Z"
        fill={l2} stroke={d} strokeWidth="0.3" />
      <path d="M0 0.2 C-1.2 -1.2 -0.6 -3.8 0 -4.2 C0.6 -3.8 1.2 -1.2 0 0.2Z"
        fill={ll} stroke={d} strokeWidth="0.22" />
      <ellipse rx="0.95" ry="0.75" fill={d3} opacity="0.5" />
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════
   FLOWER HEAD COMPONENT (Peony, Rose, Tulip, Sunflower, Lily, Carnation)
══════════════════════════════════════════════════════════════ */
function Head({ type, c, uid, designIndex = 0 }: { type: string; c: string; uid: string; designIndex?: number }) {
  const d   = mix(c, "#000000", 0.35);
  const d2  = mix(c, "#000000", 0.16);
  const l   = mix(c, "#FFFFFF", 0.38);
  const l2  = mix(c, "#FFFFFF", 0.60);
  const ll  = mix(c, "#FFFFFF", 0.82);
  const p   = uid;

  /* ── PEONY ── */
  if (type === "peony" || type.startsWith("peony")) {
    return <PeonyHead c={c} uid={uid} designIndex={designIndex} />;
  }

  /* ── TULIP ── */
  if (type === "tulip") {
    return (
      <g>
        <defs>
          <linearGradient id={`tA${p}`} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%"   stopColor={ll} />
            <stop offset="42%"  stopColor={c}  />
            <stop offset="100%" stopColor={d}  />
          </linearGradient>
          <linearGradient id={`tB${p}`} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%"   stopColor={l}  />
            <stop offset="48%"  stopColor={c}  />
            <stop offset="100%" stopColor={d}  />
          </linearGradient>
        </defs>
        {[0, 120, 240].map((r, i) => (
          <g key={`to${i}`} transform={`rotate(${r})`}>
            <path
              d="M0 2 C-6 1 -10 -5 -8.5 -12 C-7 -18 -2.5 -21 0 -21.5 C2.5 -21 7 -18 8.5 -12 C10 -5 6 1 0 2Z"
              fill={`url(#tA${p})`} stroke={d} strokeWidth="0.5" />
            <path d="M0 1.5 C-2.5 0 -4 -6 -3 -13 Q0 -17 3 -13 C4 -6 2.5 0 0 1.5Z" fill={d2} opacity="0.18" />
            <path d="M0 1 Q0.4 -10 0 -20" stroke={d} strokeWidth="0.4" fill="none" opacity="0.45" />
            <path d="M-0.5 -6 Q-4 -11 -5.5 -15" stroke={d} strokeWidth="0.22" fill="none" opacity="0.3" />
            <path d="M0.5 -6 Q4 -11 5.5 -15" stroke={d} strokeWidth="0.22" fill="none" opacity="0.3" />
          </g>
        ))}
        {[60, 180, 300].map((r, i) => (
          <g key={`ti${i}`} transform={`rotate(${r})`}>
            <path
              d="M0 1.5 C-4.5 0.5 -7 -5 -5.5 -12 C-4 -17 4 -17 5.5 -12 C7 -5 4.5 0.5 0 1.5Z"
              fill={`url(#tB${p})`} stroke={d} strokeWidth="0.45" />
            <path d="M0 1 Q0.3 -8 0 -16" stroke={d} strokeWidth="0.35" fill="none" opacity="0.38" />
          </g>
        ))}
        {[0, 60, 120, 180, 240, 300].map((r, i) => (
          <g key={`ts${i}`} transform={`rotate(${r})`}>
            <line x1="0" y1="0" x2="0" y2="-6.5" stroke="#A87A10" strokeWidth="0.5" strokeLinecap="round" />
            <ellipse cx="0" cy="-6.5" rx="0.9" ry="1.3" fill="#F5C030" />
          </g>
        ))}
        <ellipse rx="1.6" ry="1.4" fill="#6AAA5A" stroke="#3A7A3A" strokeWidth="0.4" />
      </g>
    );
  }

  /* ── SUNFLOWER ── */
  if (type === "sunflower") {
    return (
      <g>
        <defs>
          <radialGradient id={`sfD${p}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#6B4216" />
            <stop offset="65%"  stopColor="#3D2008" />
            <stop offset="100%" stopColor="#180800" />
          </radialGradient>
          <radialGradient id={`sfP${p}`} cx="30%" cy="25%" r="75%">
            <stop offset="0%"   stopColor="#FFE566" />
            <stop offset="55%"  stopColor="#F5B800" />
            <stop offset="100%" stopColor="#B86800" />
          </radialGradient>
          <radialGradient id={`sfS${p}`} cx="30%" cy="25%" r="75%">
            <stop offset="0%"   stopColor="#FFD040" />
            <stop offset="100%" stopColor="#9A5000" />
          </radialGradient>
        </defs>
        {Array.from({ length: 20 }).map((_, i) => (
          <g key={`sfp${i}`} transform={`rotate(${i * 18})`}>
            <path
              d="M0 -6 C-2.8 -8 -3.8 -15 -1.6 -19.5 C-0.5 -21 0.5 -21 1.6 -19.5 C3.8 -15 2.8 -8 0 -6Z"
              fill={`url(#sfP${p})`} stroke="#9A5800" strokeWidth="0.3" />
            <path d="M0 -7 Q0 -14 0 -20" stroke="#9A5800" strokeWidth="0.32" fill="none" opacity="0.5" />
          </g>
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <path key={`sfi${i}`} transform={`rotate(${i * 36 + 9})`}
            d="M0 -6 C-2 -7.8 -2.8 -12.5 0 -15 C2.8 -12.5 2 -7.8 0 -6Z"
            fill={`url(#sfS${p})`} />
        ))}
        <circle r="6.9" fill={`url(#sfD${p})`} />
        {Array.from({ length: 55 }).map((_, i) => {
          const angle  = i * 2.3999632;
          const rv     = r4(Math.sqrt(i + 0.5) * 0.87);
          return (
            <ellipse key={i}
              cx={r4(rv * Math.cos(angle))}
              cy={r4(rv * Math.sin(angle))}
              rx={i < 8 ? 0.35 : i < 25 ? 0.44 : 0.52}
              ry={i < 8 ? 0.42 : i < 25 ? 0.52 : 0.62}
              fill="#0D0400" opacity="0.88" />
          );
        })}
        <circle r="6.9" fill="none" stroke="#8B4A08" strokeWidth="0.5" opacity="0.55" />
      </g>
    );
  }

  /* ── LILY ── */
  if (type === "lily") {
    return (
      <g>
        <defs>
          <linearGradient id={`lyA${p}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor="#4A7A30" />
            <stop offset="22%"  stopColor={d2}      />
            <stop offset="58%"  stopColor={c}       />
            <stop offset="100%" stopColor={ll}      />
          </linearGradient>
          <radialGradient id={`lyB${p}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FFE566" />
            <stop offset="100%" stopColor="#C89010" />
          </radialGradient>
        </defs>
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={`lyp${i}`} transform={`rotate(${i * 60})`}>
            <path
              d="M0 0 C-5.5 -1.5 -8 -9 -6 -16 C-4 -21.5 -1 -23.5 0 -23.5 C1 -23.5 4 -21.5 6 -16 C8 -9 5.5 -1.5 0 0Z"
              fill={`url(#lyA${p})`} stroke={d} strokeWidth="0.45" />
            <line x1="0" y1="-0.5" x2="0" y2="-22.5" stroke={d} strokeWidth="0.5" opacity="0.38" />
            <path d="M-0.3 -6 Q-3.5 -12 -5 -17" stroke={d} strokeWidth="0.22" fill="none" opacity="0.28" />
            <path d="M0.3 -6 Q3.5 -12 5 -17" stroke={d} strokeWidth="0.22" fill="none" opacity="0.28" />
            <ellipse cx={-2.0} cy={-5}  rx="0.75" ry="0.55" fill={d} opacity="0.6" />
            <ellipse cx={ 2.2} cy={-7}  rx="0.65" ry="0.5"  fill={d} opacity="0.55" />
            <ellipse cx={-0.5} cy={-9}  rx="0.6"  ry="0.45" fill={d} opacity="0.5" />
            <ellipse cx={ 1.6} cy={-12} rx="0.5"  ry="0.4"  fill={d} opacity="0.42" />
          </g>
        ))}
        {Array.from({ length: 6 }).map((_, i) => {
          const a  = (i * 60) * (Math.PI / 180);
          const ex = r4(7 * Math.sin(a));
          const ey = r4(-7 * Math.cos(a));
          const mx = r4(ex * 0.35);
          const my = r4(ey * 0.3 + 1.2);
          return (
            <g key={`lys${i}`}>
              <path d={`M0 0 Q${mx} ${my} ${ex} ${ey}`}
                stroke="#B09010" strokeWidth="0.65" fill="none" strokeLinecap="round" />
              <ellipse cx={ex} cy={ey} rx="1.15" ry="0.7"
                transform={`rotate(${i * 60}, ${ex}, ${ey})`}
                fill={`url(#lyB${p})`} />
            </g>
          );
        })}
        <circle r="1.3" fill="#7AAA30" stroke="#4A7A20" strokeWidth="0.4" />
      </g>
    );
  }

  /* ── CARNATION ── */
  if (type === "carnation") {
    return (
      <g>
        <defs>
          <radialGradient id={`caA${p}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={ll} />
            <stop offset="58%"  stopColor={c}  />
            <stop offset="100%" stopColor={d}  />
          </radialGradient>
        </defs>
        {Array.from({ length: 12 }).map((_, i) => {
          const a   = (i / 12) * Math.PI * 2;
          const px  = r4(11 * Math.cos(a));
          const py  = r4(11 * Math.sin(a));
          const rot = r2((a * 180 / Math.PI) + 90);
          return (
            <path key={`cao${i}`} transform={`translate(${px} ${py}) rotate(${rot})`}
              d="M0 0 C-3.8 -0.8 -5 -4.5 -3 -7.2 C-1.8 -8.8 1.8 -8.8 3 -7.2 C5 -4.5 3.8 -0.8 0 0Z"
              fill={`url(#caA${p})`} stroke={d} strokeWidth="0.3" />
          );
        })}
        {Array.from({ length: 10 }).map((_, i) => {
          const a   = (i / 10) * Math.PI * 2 + 0.31;
          const px  = r4(7.2 * Math.cos(a));
          const py  = r4(7.2 * Math.sin(a));
          const rot = r2((a * 180 / Math.PI) + 90);
          return (
            <path key={`cam${i}`} transform={`translate(${px} ${py}) rotate(${rot})`}
              d="M0 0 C-3 -0.6 -3.8 -4 -2.2 -6 C-1 -7.2 1 -7.2 2.2 -6 C3.8 -4 3 -0.6 0 0Z"
              fill={`url(#caA${p})`} stroke={d} strokeWidth="0.3" />
          );
        })}
        {Array.from({ length: 8 }).map((_, i) => {
          const a   = (i / 8) * Math.PI * 2;
          const px  = r4(4.2 * Math.cos(a));
          const py  = r4(4.2 * Math.sin(a));
          const rot = r2((a * 180 / Math.PI) + 90);
          return (
            <path key={`cai${i}`} transform={`translate(${px} ${py}) rotate(${rot})`}
              d="M0 0 C-2.1 -0.5 -2.8 -3 -1.6 -4.8 C-0.5 -5.8 0.5 -5.8 1.6 -4.8 C2.8 -3 2.1 -0.5 0 0Z"
              fill={`url(#caA${p})`} stroke={d} strokeWidth="0.28" />
          );
        })}
        <circle r="1.6" fill={ll} />
      </g>
    );
  }

  /* ── ROSE (default) ── */
  return (
    <g>
      <defs>
        <radialGradient id={`roA${p}`} cx="38%" cy="30%" r="75%">
          <stop offset="0%"   stopColor={ll} />
          <stop offset="42%"  stopColor={c}  />
          <stop offset="100%" stopColor={d}  />
        </radialGradient>
        <radialGradient id={`roB${p}`} cx="44%" cy="34%" r="68%">
          <stop offset="0%"   stopColor={l}  />
          <stop offset="55%"  stopColor={c}  />
          <stop offset="100%" stopColor={d}  />
        </radialGradient>
        <radialGradient id={`roC${p}`} cx="50%" cy="38%" r="62%">
          <stop offset="0%"   stopColor={l2} />
          <stop offset="100%" stopColor={l}  />
        </radialGradient>
      </defs>
      {[0, 72, 144, 216, 288].map((rot, i) => (
        <g key={`roo${i}`} transform={`rotate(${rot})`}>
          <path
            d="M0 2.5 C-8 1 -12.5 -6 -10 -14 C-7.5 -19.5 -2.5 -21 0 -21.5 C2.5 -21 7.5 -19.5 10 -14 C12.5 -6 8 1 0 2.5Z"
            fill={`url(#roA${p})`} stroke={d} strokeWidth="0.5" />
          <path d="M0 2 C-2 -1 -3.2 -8 -1.8 -16 Q0 -19 1.5 -16 C2.8 -8 2 -1 0 2Z" fill={ll} opacity="0.14" />
          <path d="M0 1.5 Q0.5 -9 0 -20" stroke={d} strokeWidth="0.38" fill="none" opacity="0.32" />
        </g>
      ))}
      {[36, 108, 180, 252, 324].map((rot, i) => (
        <g key={`rom${i}`} transform={`rotate(${rot})`}>
          <path
            d="M0 2 C-6 0.5 -9 -5.5 -7 -12.5 C-5 -17.5 5 -17.5 7 -12.5 C9 -5.5 6 0.5 0 2Z"
            fill={`url(#roA${p})`} stroke={d} strokeWidth="0.45" />
          <path d="M0 1.5 C-1.8 -1 -2.8 -6.5 -1.5 -13 Q0 -16 1.2 -13 C2.5 -6.5 1.8 -1 0 1.5Z" fill={ll} opacity="0.12" />
        </g>
      ))}
      {[0, 90, 180, 270].map((rot, i) => (
        <g key={`roi${i}`} transform={`rotate(${rot})`}>
          <path
            d="M0 1.5 C-4.5 0.5 -6.5 -4 -5 -9.5 C-3.5 -13.5 3.5 -13.5 5 -9.5 C6.5 -4 4.5 0.5 0 1.5Z"
            fill={`url(#roB${p})`} stroke={d} strokeWidth="0.4" />
        </g>
      ))}
      {[0, 120, 240].map((rot, i) => (
        <path key={`roc${i}`} transform={`rotate(${rot})`}
          d="M0 1 C-3 0.2 -4.2 -3.2 -3 -7 C-1.8 -9.5 1.8 -9.5 3 -7 C4.2 -3.2 3 0.2 0 1Z"
          fill={`url(#roC${p})`} stroke={d} strokeWidth="0.35" />
      ))}
      <path d="M-1.5 0.5 C-2.8 -1.5 -2.2 -5.5 0 -6 C2.2 -5.5 2.8 -1.5 1.5 0.5Z" fill={l2} stroke={d} strokeWidth="0.3" />
      <path d="M0 0.2 C-1.2 -1.2 -0.8 -4.2 0 -4.8 C0.8 -4.2 1.2 -1.2 0 0.2Z" fill={l} stroke={d} strokeWidth="0.25" opacity="0.9" />
      <ellipse rx="1.0" ry="0.8" fill={d} opacity="0.42" />
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════
   BOW COMPONENT — 3D Satin Ribbon with Highlights & Tails
══════════════════════════════════════════════════════════════ */
export function Bow({ cx, cy, color, tails = true }: { cx: number; cy: number; color: string; tails?: boolean }) {
  const s = mix(color, "#000000", 0.35);
  const l = mix(color, "#FFFFFF", 0.38);
  const side = (m: number) => (
    <g>
      {/* Outer loop */}
      <path
        d={`M${cx} ${cy} C${cx + m * 52} ${cy - 38} ${cx + m * 56} ${cy + 16} ${cx + m * 8} ${cy + 5}Z`}
        fill={color} stroke={s} strokeWidth="0.8" />
      {/* Loop highlight curve */}
      <path
        d={`M${cx + m * 10} ${cy - 4} C${cx + m * 42} ${cy - 28} ${cx + m * 45} ${cy + 6} ${cx + m * 14} ${cy + 3}`}
        stroke={l} strokeWidth="1.2" fill="none" opacity="0.6" />
      {/* Inner shadow fold */}
      <path
        d={`M${cx} ${cy} C${cx + m * 24} ${cy - 12} ${cx + m * 26} ${cy + 6} ${cx + m * 6} ${cy + 4}Z`}
        fill={s} opacity="0.35" />
      {/* Flowing ribbon tails with notched v-cut end */}
      {tails && (
        <path
          d={`M${cx + m * 4} ${cy + 4} L${cx + m * 26} ${cy + 58} L${cx + m * 14} ${cy + 50} L${cx + m * 6} ${cy + 64} L${cx - m * 3} ${cy + 8}Z`}
          fill={color} stroke={s} strokeWidth="0.8" />
      )}
    </g>
  );
  return (
    <g>
      {side(-1)}
      {side(1)}
      {/* Knot with realistic round highlight */}
      <ellipse cx={cx} cy={cy + 3} rx="7.5" ry="6.2" fill={color} stroke={s} strokeWidth="0.8" />
      <ellipse cx={cx - 1.5} cy={cy + 1.5} rx="4" ry="2.5" fill={l} opacity="0.5" />
    </g>
  );
}


/* ══════════════════════════════════════════════════════════════
   ON-BOUQUET DECORATIONS: blue butterflies + blue filler blooms
══════════════════════════════════════════════════════════════ */
function ButterflyDefs() {
  return (
    <defs>
      <linearGradient id="bflyA" x1="1" y1="0.7" x2="0" y2="0.2">
        <stop offset="0%" stopColor="#bae6fd" />
        <stop offset="55%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <linearGradient id="bflyB" x1="1" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e0f2fe" />
        <stop offset="60%" stopColor="#7dd3fc" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>
  );
}

function ButterflyWing() {
  return (
    <g>
      <path d="M-1 -3 C-4 -20 -22 -30 -30 -20 C-36 -10 -22 2 -1 0 Z" fill="url(#bflyA)" stroke="#1e3a8a" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M-1 1 C-14 2 -28 8 -25 20 C-22 30 -8 24 -1 6 Z" fill="url(#bflyB)" stroke="#1e3a8a" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M-2 -2 C-12 -9 -20 -14 -27 -17" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.55" fill="none" strokeLinecap="round" />
      <path d="M-2 3 C-10 8 -16 14 -20 20" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.5" fill="none" strokeLinecap="round" />
      <circle cx="-21" cy="-14" r="2.6" fill="#FFFFFF" opacity="0.9" />
      <circle cx="-14" cy="-8" r="1.4" fill="#FFFFFF" opacity="0.8" />
      <circle cx="-16" cy="16" r="2" fill="#FFFFFF" opacity="0.9" />
    </g>
  );
}

/** One butterfly, drawn around (0,0) and placed with x / y / rotation / scale. */
function Butterfly({ x, y, r = 0, s = 1 }: { x: number; y: number; r?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter="url(#softShadow)">
      <ButterflyWing />
      <g transform="scale(-1 1)"><ButterflyWing /></g>
      {/* body + antennae */}
      <ellipse cx="0" cy="3" rx="1.7" ry="10" fill="#1e3a8a" />
      <circle cx="0" cy="-8" r="2.2" fill="#1e3a8a" />
      <path d="M-0.6 -9.5 Q-4 -17 -8 -18" stroke="#1e3a8a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <path d="M0.6 -9.5 Q4 -17 8 -18" stroke="#1e3a8a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      <circle cx="-8" cy="-18" r="1" fill="#1e3a8a" />
      <circle cx="8" cy="-18" r="1" fill="#1e3a8a" />
    </g>
  );
}

function BlueFiller({ cx, cy, k = 1 }: { cx: number; cy: number; k?: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${k})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={2.6 * Math.cos((a * Math.PI) / 180)} cy={2.6 * Math.sin((a * Math.PI) / 180)} r="2.3" fill="#60a5fa" stroke="#3b82f6" strokeWidth="0.3" />
      ))}
      <circle r="1.2" fill="#fde68a" />
    </g>
  );
}

/** Standalone butterfly (used for the accessory picker). */
export function ButterflySvg({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="-34 -30 68 60" width={size} height={size * 0.88} role="img" aria-label="Blue butterfly">
      <ButterflyDefs />
      <Butterfly x={0} y={0} s={1} />
    </svg>
  );
}

/** Standalone filler sprig (used for the accessory picker). */
export function FillersSvg({ size = 120 }: { size?: number }) {
  const pts: [number, number, number][] = [[20, 22, 1.2], [40, 14, 1.4], [60, 24, 1.2], [30, 40, 1], [52, 42, 1.1], [41, 30, 1.5]];
  return (
    <svg viewBox="0 0 80 56" width={size} height={size * 0.7} role="img" aria-label="Blue fillers">
      {pts.map(([x, y], i) => <path key={i} d={`M40 56 Q${(x + 40) / 2} ${y + 14} ${x} ${y}`} stroke="#6E8F6A" strokeWidth="1" fill="none" />)}
      {pts.map(([x, y, k], i) => <BlueFiller key={i} cx={x} cy={y} k={k} />)}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN BOUQUET SVG COMPONENT
══════════════════════════════════════════════════════════════ */
function BouquetSvg({
  type = "peony",
  count = 12,
  color = "#F48CA5",
  wrap = "classic",
  ribbon = "satin_pink",
  tag = "For you",
  size = 320,
  animate = false,
  accessory = "none",
}: {
  type?: string;
  count?: number;
  color?: string;
  wrap?: string;
  ribbon?: string;
  tag?: string;
  size?: number;
  animate?: boolean;
  accessory?: string | string[];
}) {
  const acc = parseAccessories(accessory);
  const key = `bq${instanceKey(type, color, wrap, count)}`;
  const w = WRAPS.find((x) => x.value === wrap) ?? WRAPS[0];
  const rc = (RIBBONS.find((x) => x.value === ribbon) ?? RIBBONS[0]).color;
  const kinds = ["peony_sarah_bernhardt", "peony_bowl_of_beauty", "peony_coral_sunset", "peony_duchesse_de_nemours"];
  const tints = [color, mix(color, "#FFFFFF", 0.45), "#FFFFFF", mix(color, "#FFC8D6", 0.5)];
  const s = r4(5.2 / Math.sqrt(count));

  const peonyItem = PEONY_DESIGNS.find((x) => x.value === type);
  const isPeonyType = type.startsWith("peony") || type === "peony";
  const baseDesign = peonyItem ? peonyItem.designIndex : -1;

  /* Compute positions of flower heads */
  const heads = Array.from({ length: count }).map((_, i) => {
    const r = 78 * Math.sqrt((i + 0.5) / count);
    const a = i * 2.39996;
    return {
      i,
      x: r4(150 + r * Math.cos(a)),
      y: r4(185 + r * Math.sin(a) * 0.75),
      /* Each head gets its own distinct procedural design index (0 to 31) */
      designIndex: (i * 7 + 3) % 32,
    };
  }).sort((p, q) => p.y - q.y);

  const box = wrap === "box";

  return (
    <svg
      viewBox="0 0 300 400"
      width={size}
      height={(size * 400) / 300}
      role="img"
      aria-label={`${count} ${type} bouquet`}
      className={animate ? "bloom" : undefined}
    >
      <defs>
        {/* Soft 3D drop shadow filter */}
        <filter id="softShadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" floodColor="#2A1016" floodOpacity="0.22" />
        </filter>
        {/* Ambient occlusion shadow behind heads */}
        <radialGradient id="ambBloom" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#4A1E26" stopOpacity="0.32" />
          <stop offset="70%" stopColor="#4A1E26" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#4A1E26" stopOpacity="0" />
        </radialGradient>
        {/* Wrapping paper gradients */}
        <linearGradient id={`wrapGradA_${key}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={w.a} />
          <stop offset="60%" stopColor={mix(w.a, "#000000", 0.15)} />
          <stop offset="100%" stopColor={mix(w.a, "#000000", 0.35)} />
        </linearGradient>
        <linearGradient id={`wrapGradB_${key}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={mix(w.b, "#FFFFFF", 0.3)} />
          <stop offset="50%" stopColor={w.b} />
          <stop offset="100%" stopColor={mix(w.b, "#000000", 0.2)} />
        </linearGradient>
      </defs>
      <ButterflyDefs />

      {/* ── BACKSTAGE FOLIAGE: Realistic Eucalyptus Sprigs ── */}
      {[-75, -50, -25, 0, 25, 50, 75].map((a, idx) => (
        <g key={`euc_${idx}`} transform={`translate(150 190) rotate(${a})`}>
          <line x1="0" y1="0" x2="0" y2="-105" stroke="#4D6048" strokeWidth="1.2" strokeLinecap="round" />
          <ellipse cy="-94" rx="9.5" ry="19" fill="#6E8F6A" stroke="#4D6048" strokeWidth="0.4" />
          <line x1="0" y1="-80" x2="0" y2="-106" stroke="#92B08E" strokeWidth="0.5" opacity="0.6" />
        </g>
      ))}
      {[-62, -37, -12, 12, 37, 62].map((a, idx) => (
        <g key={`euc2_${idx}`} transform={`translate(150 190) rotate(${a})`}>
          <ellipse cy="-86" rx="8" ry="16" fill="#88A984" stroke="#5A7555" strokeWidth="0.4" />
          <line x1="0" y1="-74" x2="0" y2="-98" stroke="#B8D4B4" strokeWidth="0.5" opacity="0.6" />
        </g>
      ))}

      {/* ── LUXURY GYPSOPHILA (Baby's Breath) Spray Behind Blooms ── */}
      {Array.from({ length: 18 }).map((_, i) => {
        const a = i * 0.35 - 3.14;
        const rad = 100 + ((i * 13) % 18);
        const gx = r4(150 + rad * Math.cos(a) * 0.95);
        const gy = r4(175 + rad * Math.sin(a) * 0.72);
        return (
          <g key={`gyp_bg_${i}`}>
            <line x1="150" y1="210" x2={gx} y2={gy} stroke="#8EAC88" strokeWidth="0.5" opacity="0.4" />
            <circle cx={gx} cy={gy} r="2.2" fill="#FFFFFF" stroke="#E2EBE0" strokeWidth="0.4" />
            <circle cx={gx + 2} cy={gy - 2} r="1.4" fill="#FFFFFF" opacity="0.9" />
          </g>
        );
      })}

      {/* ── BACK WRAPPING CONE ── */}
      {box ? null : (
        <g>
          {/* Outer back paper */}
          <path d="M150 376 L52 208 Q150 165 248 208 Z" fill={`url(#wrapGradB_${key})`} />
          {/* Translucent Korean ruffled tissue paper lining */}
          <path
            d="M56 206 Q80 188 105 200 Q130 182 150 198 Q170 182 195 200 Q220 188 244 206 L150 350 Z"
            fill="#FFFFFF"
            fillOpacity="0.48"
          />
        </g>
      )}

      {/* Ambient shadow bed */}
      <ellipse cx="150" cy="186" rx="86" ry="64" fill="url(#ambBloom)" />

      {/* ── FLOWER HEADS WITH 3D DEPTH & UNIQUE DESIGNS ── */}
      {heads.map(({ i, x, y, designIndex }) => {
        const rawType = type === "mixed" ? kinds[i % kinds.length] : type;
        const isHeadPeony = rawType.startsWith("peony") || rawType === "peony";
        const flowerType = isHeadPeony ? "peony" : rawType;
        const flowerColor = type === "mixed" ? tints[i % tints.length] : color;
        const headDesignIndex = isPeonyType
          ? (baseDesign === -1 || baseDesign === 31
              ? designIndex
              : baseDesign)
          : (isHeadPeony ? designIndex : i % 32);
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s}) rotate(${i * 29})`} filter="url(#softShadow)">
            <Head
              type={flowerType}
              c={flowerColor}
              uid={`${key}_h_${i}`}
              designIndex={headDesignIndex}
            />
          </g>
        );
      })}

      {/* ── FOREGROUND BABY'S BREATH (Gypsophila) FLORETS ── */}
      {Array.from({ length: 26 }).map((_, i) => {
        const dist = 68 + ((i * 7) % 24);
        const ang = i * 2.38;
        const cx = r4(150 + dist * Math.cos(ang) * 1.05);
        const cy = r4(184 + dist * Math.sin(ang) * 0.78);
        return (
          <g key={`gyp_fg_${i}`}>
            <circle cx={cx} cy={cy} r="2.0" fill="#FFFFFF" stroke="#F4EDE8" strokeWidth="0.3" opacity="0.95" />
            <circle cx={cx} cy={cy} r="0.6" fill="#F8DCA0" opacity="0.8" />
          </g>
        );
      })}

      {/* ── ON-FLOWER DECORATIONS (picked in "Add-on Accessories") ── */}
      {acc.includes("blue_fillers") && (
        <g>
          {Array.from({ length: 30 }).map((_, i) => {
            const dist = 58 + ((i * 11) % 44);
            const ang = i * 2.1;
            return <BlueFiller key={`bf_${i}`} cx={r4(150 + dist * Math.cos(ang) * 1.05)} cy={r4(182 + dist * Math.sin(ang) * 0.78)} k={0.85 + ((i * 5) % 4) * 0.12} />;
          })}
        </g>
      )}
      {acc.includes("blue_butterflies") && (
        <g>
          <Butterfly x={108} y={152} r={-30} s={0.95} />
          <Butterfly x={196} y={170} r={24} s={0.8} />
          <Butterfly x={154} y={124} r={6} s={0.62} />
        </g>
      )}

      {/* ── FRONT WRAPPING PAPER & RIBBON ── */}
      {box ? (
        <g filter="url(#softShadow)">
          <rect x="85" y="255" width="130" height="108" rx="8" fill={w.a} stroke="#E5CDD4" strokeWidth="1.2" />
          <rect x="78" y="244" width="144" height="26" rx="6" fill={w.b} stroke="#E5CDD4" strokeWidth="1.2" />
          <rect x="143" y="244" width="14" height="119" fill={rc} />
          <Bow cx={150} cy={250} color={rc} tails={false} />
        </g>
      ) : (
        <g filter="url(#softShadow)">
          {/* Left origami folded wrap */}
          <path d="M150 376 L56 218 Q108 230 150 266 Z" fill={`url(#wrapGradA_${key})`} />
          {/* Right origami folded wrap */}
          <path d="M150 376 L244 218 Q192 230 150 266 Z" fill={`url(#wrapGradA_${key})`} opacity="0.92" />
          {/* Center lapel fold */}
          <path d="M150 376 L94 246 Q150 228 206 246 Z" fill={`url(#wrapGradB_${key})`} opacity="0.96" />
          {/* Fold highlight creases */}
          <path d="M150 376 L56 218" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.3" fill="none" />
          <path d="M150 376 L244 218" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.3" fill="none" />
          {/* Ribbon band around the bouquet waist */}
          <path d="M108 298 Q150 312 192 298 L192 312 Q150 326 108 312 Z" fill={rc} />
          {/* Double-loop 3D satin bow */}
          <Bow cx={150} cy={308} color={rc} />
        </g>
      )}

      {/* ── BOUTIQUE GIFT TAG ── */}
      <g transform={`translate(${box ? 176 : 172} ${box ? 282 : 338}) rotate(12)`} filter="url(#softShadow)">
        {/* Twine hanging string */}
        <path d="M10 -6 Q20 -18 27 -24" stroke="#C5A078" strokeWidth="1.1" fill="none" />
        <rect width="56" height="32" rx="4" fill="#FDF7F0" stroke="#D8C2B0" strokeWidth="0.9" />
        {/* Eyelet hole */}
        <circle cx="9" cy="9" r="2.2" fill="#EAD9C8" stroke="#C4AA92" strokeWidth="0.8" />
        <text
          x="32"
          y="20"
          textAnchor="middle"
          fontSize="9.5"
          fontStyle="italic"
          fill="#5A3A28"
          fontFamily="Georgia, serif"
        >
          {tag.slice(0, 10)} ♡
        </text>
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   ACCESSORY SVG COMPONENTS — rendered beside the bouquet preview
══════════════════════════════════════════════════════════════ */

/** 🧸 Teddy Bear */
export function TeddyBearSvg({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} role="img" aria-label="Teddy bear">
      {/* Ears */}
      <circle cx="30" cy="22" r="13" fill="#C8906A" />
      <circle cx="30" cy="22" r="8"  fill="#E8B090" />
      <circle cx="70" cy="22" r="13" fill="#C8906A" />
      <circle cx="70" cy="22" r="8"  fill="#E8B090" />
      {/* Head */}
      <circle cx="50" cy="38" r="26" fill="#D4A07A" />
      {/* Face shading */}
      <ellipse cx="50" cy="44" rx="14" ry="10" fill="#E8B090" opacity="0.7" />
      {/* Eyes */}
      <circle cx="41" cy="34" r="4"   fill="#2A1A0E" />
      <circle cx="59" cy="34" r="4"   fill="#2A1A0E" />
      <circle cx="42.2" cy="32.8" r="1.4" fill="#fff" />
      <circle cx="60.2" cy="32.8" r="1.4" fill="#fff" />
      {/* Nose */}
      <ellipse cx="50" cy="41" rx="4.5" ry="3" fill="#6B3A22" />
      {/* Mouth */}
      <path d="M46 44.5 Q50 49 54 44.5" stroke="#6B3A22" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx="38" cy="42" rx="6" ry="3.5" fill="#F4A0A0" opacity="0.5" />
      <ellipse cx="62" cy="42" rx="6" ry="3.5" fill="#F4A0A0" opacity="0.5" />
      {/* Body */}
      <ellipse cx="50" cy="85" rx="24" ry="28" fill="#C8906A" />
      {/* Belly */}
      <ellipse cx="50" cy="84" rx="14" ry="17" fill="#E8B090" opacity="0.75" />
      {/* Arms */}
      <ellipse cx="20" cy="78" rx="10" ry="16" fill="#C8906A" transform="rotate(-18 20 78)" />
      <ellipse cx="80" cy="78" rx="10" ry="16" fill="#C8906A" transform="rotate(18 80 78)" />
      {/* Legs */}
      <ellipse cx="36" cy="108" rx="11" ry="9" fill="#C8906A" />
      <ellipse cx="64" cy="108" rx="11" ry="9" fill="#C8906A" />
      {/* Paw pads */}
      <ellipse cx="36" cy="110" rx="6" ry="4" fill="#E8B090" />
      <ellipse cx="64" cy="110" rx="6" ry="4" fill="#E8B090" />
      {/* Tiny bow */}
      <path d="M42 62 C38 58 36 60 40 63 C36 60 38 65 42 62Z" fill="#F4A0A0" />
      <path d="M58 62 C62 58 64 60 60 63 C64 60 62 65 58 62Z" fill="#F4A0A0" />
      <circle cx="50" cy="62" r="3" fill="#EB6C8A" />
    </svg>
  );
}

/** 🎈 Heart Balloon */
export function BalloonSvg({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 140" width={size} height={size * 1.4} role="img" aria-label="Heart balloon">
      <defs>
        <radialGradient id="balG" cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#FF9EC8" />
          <stop offset="55%"  stopColor="#F4406A" />
          <stop offset="100%" stopColor="#B8103E" />
        </radialGradient>
      </defs>
      {/* String */}
      <path d="M50 110 Q44 122 50 135" stroke="#B8A060" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Heart balloon body */}
      <path
        d="M50 100 C18 86 10 58 10 44 C10 24 24 14 36 14 C42 14 48 18 50 22 C52 18 58 14 64 14 C76 14 90 24 90 44 C90 58 82 86 50 100Z"
        fill="url(#balG)"
      />
      {/* Highlight */}
      <ellipse cx="38" cy="30" rx="10" ry="14" fill="#FFFFFF" opacity="0.28" transform="rotate(-20 38 30)" />
      <ellipse cx="34" cy="26" rx="4"  ry="6"  fill="#FFFFFF" opacity="0.4"  transform="rotate(-20 34 26)" />
      {/* Knot */}
      <ellipse cx="50" cy="104" rx="4" ry="3" fill="#B8103E" />
    </svg>
  );
}

/** 🍫 Chocolate Box */
export function ChocolateBoxSvg({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 110 100" width={size} height={size * 0.9} role="img" aria-label="Chocolate box">
      <defs>
        <linearGradient id="chocLidG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#A83258" />
          <stop offset="100%" stopColor="#6E0E2E" />
        </linearGradient>
        <linearGradient id="chocBoxG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#7A1830" />
          <stop offset="100%" stopColor="#4A0A1C" />
        </linearGradient>
      </defs>
      {/* Box base */}
      <rect x="10" y="42" width="90" height="52" rx="6" fill="url(#chocBoxG)" />
      {/* Lid */}
      <rect x="6"  y="22" width="98" height="26" rx="7" fill="url(#chocLidG)" />
      {/* Lid highlight */}
      <rect x="10" y="24" width="90" height="8"  rx="4" fill="#FFFFFF" opacity="0.12" />
      {/* Gold ribbon band on lid */}
      <rect x="6"  y="32" width="98" height="7"  rx="2" fill="#E8C040" opacity="0.85" />
      {/* Bow */}
      <path d="M55 35 C44 28 38 30 44 36 C38 30 40 38 55 35Z" fill="#E8C040" />
      <path d="M55 35 C66 28 72 30 66 36 C72 30 70 38 55 35Z" fill="#E8C040" />
      <circle cx="55" cy="35" r="4" fill="#FFD860" />
      {/* Chocolates grid */}
      {[0,1,2].map(row => [0,1,2,3].map(col => {
        const cx = 22 + col * 21;
        const cy = 54 + row * 13;
        const fills = ["#4A2010","#5A1828","#3A3010","#6A2018"];
        return (
          <g key={`${row}-${col}`}>
            <rect x={cx-7} y={cy-5} width="14" height="10" rx="3" fill={fills[(row*4+col)%4]} />
            <rect x={cx-5} y={cy-4} width="6"  height="3"  rx="1" fill="#FFFFFF" opacity="0.1" />
          </g>
        );
      }))}
    </svg>
  );
}

/** 🕯️ Scented Candle */
export function CandleSvg({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 130" width={size * 0.6} height={size} role="img" aria-label="Scented candle">
      <defs>
        <radialGradient id="flameG" cx="50%" cy="80%" r="60%">
          <stop offset="0%"   stopColor="#FFF5A0" />
          <stop offset="40%"  stopColor="#FFA820" />
          <stop offset="100%" stopColor="#FF4800" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="candleG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#F9EBF3" />
          <stop offset="40%"  stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E8C8D8" />
        </linearGradient>
      </defs>
      {/* Flame glow */}
      <ellipse cx="30" cy="22" rx="12" ry="14" fill="#FFA820" opacity="0.18" />
      {/* Flame */}
      <path d="M30 8 C26 12 24 18 26 22 C27 25 30 26 30 26 C30 26 33 25 34 22 C36 18 34 12 30 8Z"
        fill="url(#flameG)" />
      <path d="M30 15 C28.5 17 28 20 29 22 C29.5 23.5 30 24 30 24 C30 24 30.5 23.5 31 22 C32 20 31.5 17 30 15Z"
        fill="#FFF5A0" opacity="0.9" />
      {/* Wick */}
      <line x1="30" y1="26" x2="30" y2="34" stroke="#3A2A1A" strokeWidth="1.5" strokeLinecap="round" />
      {/* Candle body */}
      <rect x="14" y="34" width="32" height="82" rx="5" fill="url(#candleG)" />
      {/* Melt drips */}
      <path d="M20 34 Q18 42 19 50" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M37 34 Q39 44 38 54" stroke="#FFFFFF" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
      {/* Rose pattern on candle */}
      <circle cx="30" cy="80" r="10" fill="#F4A8C0" opacity="0.4" />
      <circle cx="30" cy="80" r="6"  fill="#EB6C90" opacity="0.35" />
      <circle cx="30" cy="80" r="3"  fill="#C83060" opacity="0.4" />
      {/* Coaster */}
      <ellipse cx="30" cy="116" rx="20" ry="6" fill="#D4A860" />
      <ellipse cx="30" cy="114" rx="20" ry="6" fill="#E8C880" />
      <ellipse cx="30" cy="113" rx="18" ry="4" fill="#F0D898" />
    </svg>
  );
}

/** 🌸 Macaron Box */
export function MacaronBoxSvg({ size = 120 }: { size?: number }) {
  const macarons = [
    { cx: 24, cy: 34, fill: "#F4A0C8", shadow: "#D06090" },
    { cx: 50, cy: 30, fill: "#A8D8A8", shadow: "#60A860" },
    { cx: 76, cy: 34, fill: "#F8D080", shadow: "#D0A030" },
    { cx: 24, cy: 62, fill: "#C0A0E8", shadow: "#7050C0" },
    { cx: 50, cy: 58, fill: "#F4A0C8", shadow: "#D06090" },
    { cx: 76, cy: 62, fill: "#F8A080", shadow: "#D05030" },
  ];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Macaron box">
      <defs>
        <linearGradient id="macBoxG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#FDF0F4" />
          <stop offset="100%" stopColor="#F4D8E4" />
        </linearGradient>
      </defs>
      {/* Box */}
      <rect x="6" y="14" width="88" height="80" rx="10" fill="url(#macBoxG)" stroke="#E8C0D0" strokeWidth="1.5" />
      {/* Lid edge */}
      <rect x="6" y="14" width="88" height="18" rx="10" fill="#F8E0EA" stroke="#E8C0D0" strokeWidth="1.5" />
      {/* Ribbon */}
      <rect x="46" y="14" width="8" height="80" fill="#F4A0C8" opacity="0.6" />
      <rect x="6"  y="20" width="88" height="8"  fill="#F4A0C8" opacity="0.6" />
      {/* Bow */}
      <path d="M50 24 C40 16 34 18 40 24 C34 18 36 28 50 24Z" fill="#EB6090" />
      <path d="M50 24 C60 16 66 18 60 24 C66 18 64 28 50 24Z" fill="#EB6090" />
      <circle cx="50" cy="24" r="4" fill="#FF80B0" />
      {/* Macarons */}
      {macarons.map((m, i) => (
        <g key={i}>
          {/* Shell top */}
          <ellipse cx={m.cx} cy={m.cy - 5} rx="11" ry="7" fill={m.fill} />
          {/* Foot */}
          <rect x={m.cx - 11} y={m.cy - 1} width="22" height="5" fill={m.shadow} opacity="0.5" rx="1" />
          {/* Filling */}
          <rect x={m.cx - 10} y={m.cy + 4} width="20" height="3" fill="#FFFFFF" opacity="0.6" rx="1" />
          {/* Shell bottom */}
          <ellipse cx={m.cx} cy={m.cy + 7} rx="11" ry="7" fill={m.fill} />
          {/* Shine */}
          <ellipse cx={m.cx - 3} cy={m.cy - 7} rx="4" ry="2.5" fill="#FFFFFF" opacity="0.4" transform={`rotate(-20 ${m.cx - 3} ${m.cy - 7})`} />
        </g>
      ))}
    </svg>
  );
}

/** 💝 Plush Heart */
export function PlushHeartSvg({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Plush heart">
      <defs>
        <radialGradient id="heartG" cx="38%" cy="30%" r="68%">
          <stop offset="0%"   stopColor="#FFA0C0" />
          <stop offset="55%"  stopColor="#F04070" />
          <stop offset="100%" stopColor="#B01840" />
        </radialGradient>
        <radialGradient id="heartShineG" cx="40%" cy="35%" r="55%">
          <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Plush shadow */}
      <ellipse cx="50" cy="92" rx="34" ry="6" fill="#000" opacity="0.1" />
      {/* Heart body */}
      <path
        d="M50 86 C22 70 10 50 10 36 C10 20 20 10 32 10 C38 10 44 14 50 20 C56 14 62 10 68 10 C80 10 90 20 90 36 C90 50 78 70 50 86Z"
        fill="url(#heartG)"
      />
      {/* Plush texture seam */}
      <path
        d="M50 86 C22 70 10 50 10 36 C10 20 20 10 32 10 C38 10 44 14 50 20 C56 14 62 10 68 10 C80 10 90 20 90 36 C90 50 78 70 50 86Z"
        fill="none" stroke="#C03060" strokeWidth="2.5" strokeDasharray="5,4" opacity="0.4"
      />
      {/* Shine */}
      <path
        d="M50 86 C22 70 10 50 10 36 C10 20 20 10 32 10 C38 10 44 14 50 20 C56 14 62 10 68 10 C80 10 90 20 90 36 C90 50 78 70 50 86Z"
        fill="url(#heartShineG)"
      />
      {/* Highlight blob */}
      <ellipse cx="36" cy="26" rx="12" ry="8" fill="#FFFFFF" opacity="0.3" transform="rotate(-25 36 26)" />
      {/* Ribbon on top */}
      <path d="M50 20 C42 12 36 14 42 20 C36 14 38 22 50 20Z" fill="#FFD0E8" />
      <path d="M50 20 C58 12 64 14 58 20 C64 14 62 22 50 20Z" fill="#FFD0E8" />
      <circle cx="50" cy="20" r="4" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

/** Unified Accessory Renderer */
export function AccessorySvg({ value, size = 120 }: { value: string; size?: number }) {
  if (value === "teddy_bear")    return <TeddyBearSvg size={size} />;
  if (value === "balloon")       return <BalloonSvg size={size} />;
  if (value === "chocolate_box") return <ChocolateBoxSvg size={size} />;
  if (value === "candle")        return <CandleSvg size={size} />;
  if (value === "macaron_box")   return <MacaronBoxSvg size={size} />;
  if (value === "plush_heart")   return <PlushHeartSvg size={size} />;
  if (value === "blue_butterflies") return <ButterflySvg size={size} />;
  if (value === "blue_fillers")  return <FillersSvg size={size} />;
  return null;
}

export default memo(BouquetSvg);