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
const trim = (s: string) => s.replace(/-?\d+\.\d{3,}/g, (m) => String(r2(+m)));
/** Ruffled, cupped peony petal: base at (0,0), tip at (0,-h). */
const petalPath = (h: number, w: number, f: number) =>
  trim(`M0 0C${-w * .45} ${-h * .08} ${-w * 1.05} ${-h * .38} ${-w} ${-h * .66}C${-w * .96} ${-h * .88} ${-w * .7} ${-h * (.97 + f)} ${-w * .36} ${-h * (.98 + f)}C${-w * .16} ${-h * (.96 + f * .3)} ${w * .16} ${-h * (.96 + f * .3)} ${w * .36} ${-h * (.98 + f)}C${w * .7} ${-h * (.97 + f)} ${w * .96} ${-h * .88} ${w} ${-h * .66}C${w * 1.05} ${-h * .38} ${w * .45} ${-h * .08} 0 0Z`);
const veinPath = (h: number, w: number) =>
  trim(`M0 ${-h * .1}Q${-w * .08} ${-h * .5} ${-w * .1} ${-h * .86}M${-w * .38} ${-h * .18}Q${-w * .55} ${-h * .55} ${-w * .52} ${-h * .84}M${w * .38} ${-h * .18}Q${w * .55} ${-h * .55} ${w * .52} ${-h * .84}`);

type Ly = { n: number; h: number; w: number; o: number; t: number; f: number; g: number; r: number };
const layersFor = (A: number, V: number): Ly[] => {
  const k = V % 3, s = V * 17;
  if (A === 0) return [
    { n: 8, h: 17.5, w: 10, o: 2.2, t: 1, f: .06, g: 0, r: s }, { n: 8, h: 15, w: 9.2, o: 1.9, t: .95, f: .06, g: 0, r: s + 22 },
    { n: 7, h: 12.6, w: 8.2, o: 1.5, t: .9, f: .05, g: 1, r: s + 9 }, { n: 6, h: 10, w: 7, o: 1.1, t: .86, f: .05, g: 1, r: s + 30 },
    { n: 5, h: 7.6, w: 5.8, o: .8, t: .82, f: .04, g: 2, r: s + 5 }, { n: 4, h: 5.2, w: 4.4, o: .4, t: .78, f: .03, g: 2, r: s + 40 }];
  if (A === 1) return [
    { n: 7 + k, h: 17.5, w: 11, o: 2.2, t: 1, f: .04, g: 0, r: s }, { n: 6, h: 14, w: 9.4, o: 1.8, t: .95, f: .04, g: 1, r: s + 25 }];
  if (A === 2) return [
    { n: 7 + k, h: 17.5, w: 10.6, o: 2.4, t: 1, f: .05, g: 0, r: s }, { n: 6, h: 14.4, w: 9.4, o: 2, t: .94, f: .05, g: 1, r: s + 22 },
    { n: 5, h: 11.6, w: 8, o: 1.6, t: .9, f: .05, g: 1, r: s + 36 }];
  const dir = V % 2 ? 1 : -1;
  return [8, 7, 6, 6, 5, 4, 3].map((n, i) => ({ n, h: [17.5, 15, 12.8, 10.6, 8.6, 6.6, 4.8][i], w: [9.6, 8.6, 7.6, 6.6, 5.6, 4.6, 3.6][i], o: 2.2 - i * .25, t: 1 - i * .035, f: .05, g: Math.min(i, 2), r: i * 137.5 * dir + s }));
};

/* PEONY HEAD — layered, cupped, ruffled petals with gradients, veins, contact shadows and silk grain (filter `fid`).
   4 archetypes x 8 variations = 32 designs. */
function PeonyHead({ c, uid, designIndex, fid }: { c: string; uid: string; designIndex: number; fid?: string }) {
  const dk = mix(c, "#7A0C30", .5), d = mix(c, "#7A0C30", .22), l = mix(c, "#FFFFFF", .4), ll = mix(c, "#FFFFFF", .78);
  const gold = "#F6C543", goldD = "#B9800F", goldL = "#FFF3B8";
  const p = `${uid}_d${designIndex}`;
  const A = designIndex % 4, V = Math.floor(designIndex / 4) % 8;
  const layers = layersFor(A, V);
  const stops: [string, string, string][] = [[mix(c, "#8A1238", .5), mix(c, "#8A1238", .06), mix(c, "#FFFFFF", .5)], [dk, mix(c, "#2A0510", .12), mix(c, "#FFFFFF", .62)], [dk, c, ll]];
  return (
    <g filter={fid ? `url(#${fid})` : undefined}>
      <defs>
        {stops.map(([a, b, e], i) => (
          <linearGradient key={i} id={`g${i}_${p}`} x1=".5" y1="1" x2=".5" y2="0">
            <stop offset="0" stopColor={a} /><stop offset=".45" stopColor={b} /><stop offset="1" stopColor={e} />
          </linearGradient>
        ))}
        <radialGradient id={`sh_${p}`}><stop offset=".5" stopColor="#1A0309" stopOpacity="0" /><stop offset=".82" stopColor="#1A0309" stopOpacity=".38" /><stop offset="1" stopColor="#1A0309" stopOpacity=".7" /></radialGradient>
        <linearGradient id={`au_${p}`} x1=".5" y1="1" x2=".5" y2="0"><stop offset="0" stopColor={goldD} /><stop offset=".6" stopColor={gold} /><stop offset="1" stopColor={goldL} /></linearGradient>
      </defs>
      {layers.map((L, li) => (
        <g key={li}>
          <circle r={r2(L.h * 1.02)} fill={`url(#sh_${p})`} />
          {Array.from({ length: L.n }).map((_, i) => {
            const a = r2(L.r + (i * 360) / L.n + (i % 2 ? 4 : -4));
            const sc = 1 + (((i * 7 + li * 3) % 5) - 2) * .035;
            return (
              <g key={i} transform={`rotate(${a}) translate(0 ${-L.o}) scale(${r2(sc)} ${r2(L.t * sc)})`}>
                <path d={petalPath(L.h, L.w, L.f)} fill={`url(#g${L.g}_${p})`} stroke={dk} strokeOpacity=".5" strokeWidth=".3" />
                <path d={veinPath(L.h, L.w)} fill="none" stroke={dk} strokeOpacity=".2" strokeWidth=".2" />
                <ellipse cx={r2(-L.w * .2)} cy={r2(-L.h * .82)} rx={r2(L.w * .38)} ry={r2(L.h * .09)} fill="#fff" opacity=".24" transform={`rotate(-12 ${r2(-L.w * .2)} ${r2(-L.h * .82)})`} />
              </g>
            );
          })}
        </g>
      ))}
      {A === 1 && (
        <g>
          {Array.from({ length: 24 }).map((_, i) => (
            <g key={i} transform={`rotate(${i * 15 + (i % 2) * 6}) translate(0 -.6) scale(1 ${1 + (i % 3) * .12})`}>
              <path d={petalPath(6.4, 1.7, .25)} fill={`url(#au_${p})`} stroke={goldD} strokeWidth=".15" strokeOpacity=".5" />
            </g>
          ))}
        </g>
      )}
      {A === 2 && (
        <g>
          <circle r="5.4" fill={`url(#sh_${p})`} />
          {Array.from({ length: 18 + V }).map((_, i) => {
            const a = (i / (18 + V)) * Math.PI * 2, L = 3.4 + (i % 3) * .7;
            const x = r4(L * Math.cos(a)), y = r4(L * Math.sin(a));
            return <g key={i}><line x1="0" y1="0" x2={x} y2={y} stroke={goldD} strokeWidth=".35" /><ellipse cx={x} cy={y} rx=".95" ry=".65" transform={`rotate(${r2((a * 180) / Math.PI)} ${x} ${y})`} fill={`url(#au_${p})`} stroke={goldD} strokeWidth=".15" /></g>;
          })}
          {[0, 120, 240].map((r) => <path key={r} transform={`rotate(${r})`} d="M0 0C-.7-1-.9-2.4 0-3.2C.9-2.4.7-1 0 0Z" fill="#D8335A" stroke="#7C1230" strokeWidth=".15" />)}
          <circle r="1.1" fill="#8DB852" stroke="#4A7A24" strokeWidth=".2" />
        </g>
      )}
      {(A === 0 || A === 3) && (
        <g>
          <circle r="3.4" fill={`url(#sh_${p})`} />
          {[0, 120, 240].map((r) => <path key={r} transform={`rotate(${r + V * 9}) translate(0 -.4)`} d={petalPath(4.6, 2.5, .08)} fill={`url(#g2_${p})`} stroke={dk} strokeWidth=".2" strokeOpacity=".4" />)}
          <ellipse rx="1" ry=".8" fill={dk} opacity=".45" />
        </g>
      )}
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════
   FLOWER HEAD COMPONENT (Peony, Rose, Tulip, Sunflower, Lily, Carnation)
══════════════════════════════════════════════════════════════ */
function Head({ type, c, uid, designIndex = 0, fid }: { type: string; c: string; uid: string; designIndex?: number; fid?: string }) {
  const d   = mix(c, "#000000", 0.35);
  const d2  = mix(c, "#000000", 0.16);
  const l   = mix(c, "#FFFFFF", 0.38);
  const l2  = mix(c, "#FFFFFF", 0.60);
  const ll  = mix(c, "#FFFFFF", 0.82);
  const p   = uid;

  /* ── PEONY ── */
  if (type === "peony" || type.startsWith("peony")) {
    return <PeonyHead c={c} uid={uid} designIndex={designIndex} fid={fid} />;
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
  const id = `bw${color.replace("#", "")}`;
  const dk = mix(color, "#000000", 0.5), md = mix(color, "#000000", 0.18), lt = mix(color, "#FFFFFF", 0.6);
  const loop = (m: number) => (
    <g>
      <path d={`M${cx} ${cy + 2}C${cx + m * 30} ${cy - 56} ${cx + m * 78} ${cy - 36} ${cx + m * 64} ${cy - 4}C${cx + m * 55} ${cy + 14} ${cx + m * 22} ${cy + 10} ${cx} ${cy + 4}Z`} fill={`url(#${id}${m < 0 ? "B" : "A"})`} stroke={dk} strokeWidth=".7" />
      <path d={`M${cx + m * 6} ${cy} C${cx + m * 28} ${cy - 40} ${cx + m * 58} ${cy - 30} ${cx + m * 54} ${cy - 6}`} stroke={lt} strokeWidth="1.5" fill="none" opacity=".7" strokeLinecap="round" />
      <path d={`M${cx + m * 10} ${cy + 3} C${cx + m * 30} ${cy - 14} ${cx + m * 48} ${cy - 12} ${cx + m * 58} ${cy - 8}`} stroke={dk} strokeWidth="1" fill="none" opacity=".35" />
      <path d={`M${cx} ${cy + 4}C${cx + m * 34} ${cy + 8} ${cx + m * 66} ${cy + 26} ${cx + m * 50} ${cy + 38}C${cx + m * 36} ${cy + 44} ${cx + m * 14} ${cy + 22} ${cx} ${cy + 6}Z`} fill={`url(#${id}${m < 0 ? "A" : "B"})`} stroke={dk} strokeWidth=".7" />
      <path d={`M${cx + m * 8} ${cy + 8} C${cx + m * 30} ${cy + 14} ${cx + m * 44} ${cy + 26} ${cx + m * 42} ${cy + 36}`} stroke={lt} strokeWidth="1.1" fill="none" opacity=".55" />
    </g>
  );
  const tail = (m: number) => (
    <g>
      <path d={`M${cx + m * 3} ${cy + 6}C${cx + m * 12} ${cy + 30} ${cx + m * 30} ${cy + 54} ${cx + m * 38} ${cy + 80}L${cx + m * 28} ${cy + 72}L${cx + m * 22} ${cy + 86}C${cx + m * 14} ${cy + 58} ${cx} ${cy + 32} ${cx - m * 3} ${cy + 8}Z`} fill={`url(#${id}T)`} stroke={dk} strokeWidth=".7" />
      <path d={`M${cx + m * 6} ${cy + 14}C${cx + m * 16} ${cy + 36} ${cx + m * 28} ${cy + 56} ${cx + m * 33} ${cy + 74}`} stroke={lt} strokeWidth="1" fill="none" opacity=".5" />
    </g>
  );
  return (
    <g>
      <defs>
        {[["A", 0, 1], ["B", 1, 0]].map(([n, a, b]) => (
          <linearGradient key={String(n)} id={`${id}${n}`} x1={String(a)} y1=".2" x2={String(b)} y2=".9">
            <stop offset="0" stopColor={dk} /><stop offset=".3" stopColor={md} /><stop offset=".5" stopColor={lt} /><stop offset=".72" stopColor={color} /><stop offset="1" stopColor={dk} />
          </linearGradient>
        ))}
        <linearGradient id={`${id}T`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={md} /><stop offset=".5" stopColor={lt} /><stop offset="1" stopColor={dk} /></linearGradient>
        <radialGradient id={`${id}K`} cx=".38" cy=".3" r=".8"><stop offset="0" stopColor={lt} /><stop offset=".5" stopColor={color} /><stop offset="1" stopColor={dk} /></radialGradient>
      </defs>
      {tails && <g>{tail(-1)}{tail(1)}</g>}
      {loop(-1)}{loop(1)}
      <ellipse cx={cx} cy={cy + 3} rx="8.5" ry="7" fill={`url(#${id}K)`} stroke={dk} strokeWidth=".7" />
      <path d={`M${cx - 5} ${cy} Q${cx} ${cy + 3} ${cx + 5} ${cy}M${cx - 5} ${cy + 5} Q${cx} ${cy + 8} ${cx + 5} ${cy + 5}`} stroke={dk} strokeWidth=".6" fill="none" opacity=".45" />
      <ellipse cx={cx - 2.5} cy={cy + 1} rx="3.4" ry="1.8" fill="#fff" opacity=".5" />
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
      <path d="M-2 -2 L-26 -19M-2 -2 L-30 -11M-2 -2 L-20 -26M-2 3 L-22 18M-2 3 L-24 10" stroke="#1e3a8a" strokeWidth="0.5" opacity="0.5" fill="none" strokeLinecap="round" />
      <path d="M-4 -4 C-14 -10 -24 -16 -29 -19" stroke="#FFFFFF" strokeWidth="0.9" opacity="0.5" fill="none" strokeLinecap="round" />
      <path d="M-30 -20 C-34 -12 -26 -2 -22 -2" stroke="#0f172a" strokeWidth="1.4" opacity="0.35" fill="none" />
      {[[-21, -14, 2.6], [-14, -8, 1.4], [-16, 16, 2], [-24, 14, 1.2], [-27, -16, 1.3]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity="0.88" />)}
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

/** Veined leaf, base at (0,0) pointing up. */
function Leaf({ x, y, r, len, w, g }: { x: number; y: number; r: number; len: number; w: number; g: string }) {
  const veins = [1, 2, 3, 4].map((j) => {
    const yy = -len * (0.12 + 0.17 * j);
    return `M0 ${r2(yy)}Q${r2(w * 0.4)} ${r2(yy - len * 0.07)} ${r2(w * 0.78)} ${r2(yy - len * 0.17)}M0 ${r2(yy)}Q${r2(-w * 0.4)} ${r2(yy - len * 0.07)} ${r2(-w * 0.78)} ${r2(yy - len * 0.17)}`;
  }).join("");
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d={`M0 0C${w} ${r2(-len * 0.2)} ${r2(w * 0.85)} ${r2(-len * 0.78)} 0 ${-len}C${r2(-w * 0.85)} ${r2(-len * 0.78)} ${-w} ${r2(-len * 0.2)} 0 0Z`} fill={`url(#${g})`} stroke="#27492B" strokeOpacity=".5" strokeWidth=".5" />
      <path d={veins} stroke="#1F3F25" strokeOpacity=".28" strokeWidth=".5" fill="none" />
      <path d={`M0 -2L0 ${r2(-len * 0.93)}`} stroke="#CFE6B8" strokeOpacity=".55" strokeWidth=".9" strokeLinecap="round" />
      <path d={`M0 0C${w} ${r2(-len * 0.2)} ${r2(w * 0.85)} ${r2(-len * 0.78)} 0 ${-len}Z`} fill="#fff" opacity=".08" />
    </g>
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
  const pf = ({ classic: "0.018 0.07", korean: "0.012 0.04", burlap: "0.55 0.55", premium: "0.02 0.09" } as Record<string, string>)[wrap] ?? "0.018 0.07";

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
        {/* Silk grain + slightly crumpled petal edges */}
        <filter id={`petalTex_${key}`} x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="0.7" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.06 0.16" numOctaves="3" seed="11" result="t" />
          <feDiffuseLighting in="t" lightingColor="#ffffff" surfaceScale="1.4" result="lit0"><feDistantLight azimuth="235" elevation="55" /></feDiffuseLighting>
          <feComponentTransfer in="lit0" result="lit"><feFuncR type="linear" slope=".42" intercept=".6" /><feFuncG type="linear" slope=".42" intercept=".6" /><feFuncB type="linear" slope=".42" intercept=".6" /></feComponentTransfer>
          <feComposite in="lit" in2="d" operator="in" result="li" />
          <feBlend in="d" in2="li" mode="multiply" />
        </filter>
        {/* Crinkled paper: lit turbulence multiplied over the sheet */}
        <filter id={`paperTex_${key}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={pf} numOctaves="3" seed="8" result="t" />
          <feDiffuseLighting in="t" lightingColor="#ffffff" surfaceScale="2.4" result="lit"><feDistantLight azimuth="225" elevation="58" /></feDiffuseLighting>
          <feComposite in="lit" in2="SourceGraphic" operator="in" result="li" />
          <feBlend in="SourceGraphic" in2="li" mode="multiply" />
        </filter>
        <linearGradient id={`leafG_${key}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2B5430" /><stop offset=".42" stopColor="#5E9A52" /><stop offset=".58" stopColor="#86BC70" /><stop offset="1" stopColor="#2F5A33" />
        </linearGradient>
        <linearGradient id={`eucG_${key}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5D8277" /><stop offset=".5" stopColor="#A9C6B7" /><stop offset="1" stopColor="#648A7C" />
        </linearGradient>
      </defs>
      <ButterflyDefs />

      {/* ── BACKSTAGE FOLIAGE: lobed peony leaves + silvery eucalyptus ── */}
      {[-78, -58, -38, -18, 2, 22, 42, 62, 80].map((a, i) => {
        const L = 100 + ((i * 17) % 24);
        return (
          <g key={`pl_${i}`} transform={`translate(150 212) rotate(${a})`}>
            <Leaf x={0} y={0} r={0} len={L} w={17 + ((i * 5) % 5)} g={`leafG_${key}`} />
            <Leaf x={0} y={-L * 0.3} r={-40} len={L * 0.55} w={10} g={`leafG_${key}`} />
            <Leaf x={0} y={-L * 0.3} r={40} len={L * 0.55} w={10} g={`leafG_${key}`} />
          </g>
        );
      })}
      {[-68, -28, 12, 50, 74].map((a, i) => (
        <g key={`eu_${i}`} transform={`translate(150 205) rotate(${a})`}>
          <line x1="0" y1="0" x2="0" y2="-118" stroke="#4D6048" strokeWidth="1.3" strokeLinecap="round" />
          {[-28, -50, -72, -94].map((yy) => (
            <g key={yy}>
              <Leaf x={0} y={yy} r={-52} len={17} w={8} g={`eucG_${key}`} />
              <Leaf x={0} y={yy} r={52} len={17} w={8} g={`eucG_${key}`} />
            </g>
          ))}
          <Leaf x={0} y={-112} r={0} len={16} w={7} g={`eucG_${key}`} />
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

      {/* ── BACK WRAPPING CONE (crinkled paper + sheer tissue) ── */}
      {box ? null : (
        <g>
          <g filter={`url(#paperTex_${key})`}>
            <path d="M150 380L44 206Q66 186 94 200Q120 180 150 198Q180 180 206 200Q234 186 256 206Z" fill={`url(#wrapGradB_${key})`} />
          </g>
          <path d="M44 206Q66 186 94 200Q120 180 150 198Q180 180 206 200Q234 186 256 206" stroke="#fff" strokeOpacity=".5" strokeWidth="1.1" fill="none" />
          <path d="M60 208Q82 190 106 202Q130 186 150 200Q170 186 194 202Q218 190 240 208L150 352Z" fill="#fff" fillOpacity=".42" />
          {[-84, -52, -22, 22, 52, 84].map((dx) => <path key={dx} d={`M150 380L${150 + dx * 1.18} 206`} stroke="#3A1620" strokeOpacity=".14" strokeWidth="1.6" />)}
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
              fid={`petalTex_${key}`}
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
          {/* Foreground leaves tucked at the wrap line */}
          <g>
            <Leaf x={112} y={250} r={-62} len={48} w={11} g={`leafG_${key}`} />
            <Leaf x={188} y={250} r={62} len={48} w={11} g={`leafG_${key}`} />
            <Leaf x={134} y={242} r={-28} len={40} w={10} g={`leafG_${key}`} />
            <Leaf x={166} y={242} r={28} len={40} w={10} g={`leafG_${key}`} />
          </g>
          <g filter={`url(#paperTex_${key})`}>
            <path d="M150 376L56 218Q108 230 150 266Z" fill={`url(#wrapGradA_${key})`} />
            <path d="M150 376L244 218Q192 230 150 266Z" fill={`url(#wrapGradA_${key})`} />
            <path d="M150 376L94 246Q150 226 206 246Z" fill={`url(#wrapGradB_${key})`} />
          </g>
          {/* fold shadows + paper-edge highlights */}
          <path d="M150 376L94 246Q150 226 206 246Z" fill="none" stroke="#2A0E16" strokeOpacity=".22" strokeWidth="1.6" />
          <path d="M96 248Q150 230 204 248" stroke="#fff" strokeOpacity=".7" strokeWidth="1.1" fill="none" />
          {[-30, -16, 0, 16, 30].map((dx) => <path key={dx} d={`M150 376L${150 + dx * 1.9} ${252 - Math.abs(dx) * 0.5}`} stroke={dx % 2 ? "#fff" : "#2A0E16"} strokeOpacity={dx % 2 ? ".28" : ".13"} strokeWidth="1.2" />)}
          <path d="M150 376L56 218M150 376L244 218" stroke="#fff" strokeOpacity=".45" strokeWidth="1" fill="none" />
          <path d="M56 218Q108 230 150 266M244 218Q192 230 150 266" stroke="#2A0E16" strokeOpacity=".2" strokeWidth="1.3" fill="none" />
          {wrap === "premium" && <path d="M56 218Q108 230 150 266Q192 230 244 218M94 246Q150 226 206 246" stroke="#D4AF37" strokeWidth="1.8" fill="none" />}
          {wrap === "korean" && <path d="M58 220Q76 212 94 222Q112 212 130 224Q150 214 170 224Q188 212 206 222Q224 212 242 220L150 300Z" fill="#fff" fillOpacity=".38" stroke="#fff" strokeOpacity=".6" strokeWidth=".8" />}
          {/* gathered satin waist band with pleat shading */}
          <path d="M104 297Q150 313 196 297L190 314Q150 330 110 314Z" fill={`url(#bw${rc.replace("#", "")}A)`} stroke={mix(rc, "#000000", 0.5)} strokeWidth=".6" />
          {[116, 130, 144, 158, 172, 184].map((x) => <path key={x} d={`M${x} 304L${x + 2} 322`} stroke={mix(rc, "#000000", 0.5)} strokeOpacity=".3" strokeWidth="1" />)}
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

/** 🧸 Teddy Bear — fuzzy fur, glossy eyes, stitched smile, satin bow tie */
export function TeddyBearSvg({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 124" width={size} height={size * 1.24} role="img" aria-label="Teddy bear">
      <defs>
        <radialGradient id="tdF" cx=".4" cy=".3" r=".85"><stop offset="0" stopColor="#EBC79F" /><stop offset=".55" stopColor="#C99062" /><stop offset="1" stopColor="#8A5733" /></radialGradient>
        <radialGradient id="tdM" cx=".5" cy=".35" r=".75"><stop offset="0" stopColor="#FAE6CC" /><stop offset="1" stopColor="#D9AC7C" /></radialGradient>
        <radialGradient id="tdG"><stop offset="0" stopColor="#000" stopOpacity=".28" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <radialGradient id="tdE" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#6A4A3A" /><stop offset="1" stopColor="#120805" /></radialGradient>
        <linearGradient id="tdB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FF9FBF" /><stop offset=".5" stopColor="#E84A7A" /><stop offset="1" stopColor="#A81E4A" /></linearGradient>
        <filter id="tdFur" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <ellipse cx="50" cy="116" rx="34" ry="6" fill="url(#tdG)" />
      <g filter="url(#tdFur)">
        <ellipse cx="34" cy="106" rx="12" ry="10" fill="url(#tdF)" /><ellipse cx="66" cy="106" rx="12" ry="10" fill="url(#tdF)" />
        <ellipse cx="50" cy="84" rx="25" ry="29" fill="url(#tdF)" />
        <ellipse cx="19" cy="78" rx="10" ry="17" fill="url(#tdF)" transform="rotate(-20 19 78)" /><ellipse cx="81" cy="78" rx="10" ry="17" fill="url(#tdF)" transform="rotate(20 81 78)" />
        <circle cx="29" cy="21" r="13" fill="url(#tdF)" /><circle cx="71" cy="21" r="13" fill="url(#tdF)" />
        <circle cx="50" cy="38" r="27" fill="url(#tdF)" />
      </g>
      <circle cx="29" cy="21" r="7.5" fill="url(#tdM)" opacity=".9" /><circle cx="71" cy="21" r="7.5" fill="url(#tdM)" opacity=".9" />
      <ellipse cx="50" cy="86" rx="15" ry="19" fill="url(#tdM)" opacity=".8" />
      <ellipse cx="34" cy="108" rx="6.5" ry="4.5" fill="url(#tdM)" /><ellipse cx="66" cy="108" rx="6.5" ry="4.5" fill="url(#tdM)" />
      <ellipse cx="50" cy="45" rx="14" ry="11" fill="url(#tdM)" />
      <circle cx="40" cy="33" r="4.2" fill="url(#tdE)" /><circle cx="60" cy="33" r="4.2" fill="url(#tdE)" />
      <circle cx="41.4" cy="31.6" r="1.5" fill="#fff" /><circle cx="61.4" cy="31.6" r="1.5" fill="#fff" /><circle cx="39" cy="34.4" r=".7" fill="#fff" opacity=".7" /><circle cx="59" cy="34.4" r=".7" fill="#fff" opacity=".7" />
      <ellipse cx="50" cy="41" rx="5" ry="3.4" fill="url(#tdE)" /><ellipse cx="48.6" cy="39.8" rx="1.8" ry=".9" fill="#fff" opacity=".6" />
      <path d="M50 44.4V47M44.6 49Q50 52.6 55.4 49" stroke="#4A2616" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeDasharray="2.2 1.2" />
      <ellipse cx="34" cy="43" rx="5.5" ry="3.2" fill="#F48FA0" opacity=".45" /><ellipse cx="66" cy="43" rx="5.5" ry="3.2" fill="#F48FA0" opacity=".45" />
      <path d="M50 60C42 52 34 58 38 64C42 68 48 64 50 62C52 64 58 68 62 64C66 58 58 52 50 60Z" fill="url(#tdB)" stroke="#8E1740" strokeWidth=".6" />
      <circle cx="50" cy="61" r="3.4" fill="url(#tdB)" stroke="#8E1740" strokeWidth=".5" /><ellipse cx="49" cy="60" rx="1.4" ry=".8" fill="#fff" opacity=".6" />
    </svg>
  );
}

/** 🎈 Heart Foil Balloon — crimped edge, glossy highlights, curly ribbon */
export function BalloonSvg({ size = 120 }: { size?: number }) {
  const H = "M50 100C18 86 10 58 10 44C10 24 24 14 36 14C42 14 48 18 50 22C52 18 58 14 64 14C76 14 90 24 90 44C90 58 82 86 50 100Z";
  return (
    <svg viewBox="0 0 100 140" width={size} height={size * 1.4} role="img" aria-label="Heart balloon">
      <defs>
        <radialGradient id="balG" cx="36%" cy="28%" r="75%"><stop offset="0" stopColor="#FFB3D2" /><stop offset=".4" stopColor="#F9477A" /><stop offset="1" stopColor="#A50F3B" /></radialGradient>
        <linearGradient id="balRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".7" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".35" /></linearGradient>
      </defs>
      <path d="M50 106C42 114 58 120 48 128C42 134 54 136 50 139" stroke="#E7C86A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d={H} fill="url(#balG)" />
      <path d={H} fill="none" stroke="url(#balRim)" strokeWidth="5" strokeDasharray="1.6 1.6" opacity=".75" />
      <path d="M50 22C50 40 46 70 50 98" stroke="#fff" strokeOpacity=".16" strokeWidth="1.4" fill="none" />
      <path d="M22 34C20 46 26 60 36 72" stroke="#fff" strokeOpacity=".3" strokeWidth="1.2" fill="none" />
      <ellipse cx="34" cy="30" rx="9" ry="14" fill="#fff" opacity=".42" transform="rotate(-24 34 30)" />
      <ellipse cx="30" cy="25" rx="3" ry="5" fill="#fff" opacity=".7" transform="rotate(-24 30 25)" />
      <path d="M46 101L54 101L56 108L44 108Z" fill="#B20E3F" stroke="#7A0A2A" strokeWidth=".5" />
    </svg>
  );
}

/** 🍫 Chocolate Box — open tray of glossy truffles in paper cups, ribboned lid */
export function ChocolateBoxSvg({ size = 120 }: { size?: number }) {
  const tones: [string, string][] = [["#7A4A30", "#2A120A"], ["#5A2A1C", "#1E0A08"], ["#C9965E", "#6A3A18"], ["#6E2236", "#2A0A14"]];
  return (
    <svg viewBox="0 0 110 100" width={size} height={size * 0.9} role="img" aria-label="Chocolate box">
      <defs>
        <linearGradient id="chL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B8365F" /><stop offset="1" stopColor="#6A0F2D" /></linearGradient>
        <linearGradient id="chT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A1220" /><stop offset="1" stopColor="#2A0810" /></linearGradient>
        <linearGradient id="chG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE9A0" /><stop offset=".5" stopColor="#E3B63F" /><stop offset="1" stopColor="#A87A16" /></linearGradient>
        {tones.map(([a, b], i) => <radialGradient key={i} id={`chC${i}`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></radialGradient>)}
      </defs>
      <rect x="10" y="4" width="90" height="34" rx="6" fill="url(#chL)" />
      <rect x="10" y="4" width="90" height="9" rx="5" fill="#fff" opacity=".14" />
      <rect x="50" y="4" width="10" height="34" fill="url(#chG)" />
      <path d="M55 16C44 6 36 10 44 18C36 12 38 24 55 20ZM55 16C66 6 74 10 66 18C74 12 72 24 55 20Z" fill="url(#chG)" stroke="#A87A16" strokeWidth=".5" />
      <circle cx="55" cy="18" r="4" fill="url(#chG)" />
      <path d="M6 46L104 46L98 94Q55 100 12 94Z" fill="url(#chT)" stroke="#E3B63F" strokeWidth="1" />
      {[0, 1, 2].map((row) => [0, 1, 2, 3].map((col) => {
        const x = 24 + col * 21 + (row % 2) * 4, y = 58 + row * 12, i = (row * 4 + col) % 4;
        return (
          <g key={`${row}-${col}`}>
            <path d={`M${x - 8} ${y + 2}L${x - 6} ${y + 8}H${x + 6}L${x + 8} ${y + 2}Z`} fill="#E8D2B0" stroke="#B8966A" strokeWidth=".4" />
            <ellipse cx={x} cy={y} rx="7" ry="5.6" fill={`url(#chC${i})`} />
            <ellipse cx={x - 2.4} cy={y - 2.2} rx="2.4" ry="1.3" fill="#fff" opacity=".55" />
          </g>
        );
      }))}
    </svg>
  );
}

/** 🕯️ Scented Candle — glass jar, wax pool, glowing flame */
export function CandleSvg({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 60 130" width={size * 0.6} height={size} role="img" aria-label="Scented candle">
      <defs>
        <radialGradient id="flameG" cx="50%" cy="75%" r="65%"><stop offset="0" stopColor="#FFFBD0" /><stop offset=".35" stopColor="#FFB63A" /><stop offset="1" stopColor="#FF4800" stopOpacity="0" /></radialGradient>
        <radialGradient id="glowG"><stop offset="0" stopColor="#FFC25A" stopOpacity=".5" /><stop offset="1" stopColor="#FFC25A" stopOpacity="0" /></radialGradient>
        <linearGradient id="jarG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E4C9D6" /><stop offset=".25" stopColor="#FFFFFF" /><stop offset=".6" stopColor="#F2DDE6" /><stop offset="1" stopColor="#C79BB0" /></linearGradient>
        <linearGradient id="waxG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#F6E6D2" /><stop offset=".5" stopColor="#FFF8EC" /><stop offset="1" stopColor="#E8CFB4" /></linearGradient>
      </defs>
      <circle cx="30" cy="22" r="20" fill="url(#glowG)" />
      <path d="M30 6C25 12 23 18 26 23C27 26 30 27 30 27C30 27 33 26 34 23C37 18 35 12 30 6Z" fill="url(#flameG)" />
      <path d="M30 15C28.5 17.5 28 20 29 22.5C29.6 24 30 24.5 30 24.5C30 24.5 30.4 24 31 22.5C32 20 31.5 17.5 30 15Z" fill="#FFF8C0" />
      <path d="M30 27V36" stroke="#2A1A10" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 40Q12 36 16 36H44Q48 36 48 40V112Q48 120 40 120H20Q12 120 12 112Z" fill="url(#jarG)" stroke="#C79BB0" strokeWidth=".8" />
      <ellipse cx="30" cy="40" rx="17.5" ry="4.4" fill="url(#waxG)" stroke="#D9BFA4" strokeWidth=".5" />
      <ellipse cx="30" cy="40.4" rx="4.5" ry="1.2" fill="#C8A47C" opacity=".6" />
      <path d="M13 60H47V104H13Z" fill="#FFF6EE" opacity=".9" /><path d="M13 60H47M13 104H47" stroke="#D4AF37" strokeWidth=".8" />
      <g transform="translate(30 82)"><circle r="9" fill="#F4A8C0" opacity=".55" /><circle r="5.8" fill="#EB6C90" opacity=".6" /><circle r="3" fill="#C83060" opacity=".7" /><path d="M-9 6Q-14 2-12 -4M9 6Q14 2 12 -4" stroke="#6E8F6A" strokeWidth="1.4" fill="none" /></g>
      <path d="M16 42V110" stroke="#fff" strokeOpacity=".7" strokeWidth="2.6" strokeLinecap="round" /><path d="M43 46V100" stroke="#fff" strokeOpacity=".35" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="30" cy="122" rx="20" ry="4.5" fill="#000" opacity=".16" />
    </svg>
  );
}

/** 🌸 Macaron Box — ruffled-foot shells with cream filling in a ribboned tray */
export function MacaronBoxSvg({ size = 120 }: { size?: number }) {
  const ms: [number, number, string, string][] = [[24, 40, "#FFB8D6", "#E0709F"], [50, 36, "#BFE6B8", "#6FB067"], [76, 40, "#FFDE95", "#D9A93A"], [24, 66, "#D2B8F2", "#8460CC"], [50, 62, "#FFB8D6", "#E0709F"], [76, 66, "#FFB59A", "#D86A48"]];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Macaron box">
      <defs>
        <linearGradient id="macBoxG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF6F9" /><stop offset="1" stopColor="#F2CFDD" /></linearGradient>
        <linearGradient id="macRib" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFA6C6" /><stop offset=".5" stopColor="#EE5C93" /><stop offset="1" stopColor="#B82F68" /></linearGradient>
        {ms.map(([, , a, b], i) => <radialGradient key={i} id={`mc${i}`} cx=".35" cy=".3" r=".85"><stop offset="0" stopColor="#fff" stopOpacity=".7" /><stop offset=".3" stopColor={a} /><stop offset="1" stopColor={b} /></radialGradient>)}
      </defs>
      <path d="M6 28L94 28L90 92Q50 98 10 92Z" fill="url(#macBoxG)" stroke="#E2B6C8" strokeWidth="1.2" />
      <rect x="45" y="28" width="10" height="66" fill="url(#macRib)" opacity=".9" />
      {ms.map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y + 8} rx="11" ry="6.2" fill={`url(#mc${i})`} />
          <ellipse cx={x} cy={y + 3.6} rx="11.6" ry="3.2" fill="#FFFDF8" stroke="#F0DDD2" strokeWidth=".4" />
          <ellipse cx={x} cy={y - 1} rx="11" ry="7" fill={`url(#mc${i})`} />
          <path d={`M${x - 10} ${y + 2.4}Q${x} ${y + 6} ${x + 10} ${y + 2.4}`} stroke="#fff" strokeOpacity=".5" strokeWidth="1.2" strokeDasharray="1.4 1" fill="none" />
          <ellipse cx={x - 3.4} cy={y - 3.6} rx="3.6" ry="1.8" fill="#fff" opacity=".5" transform={`rotate(-18 ${x - 3.4} ${y - 3.6})`} />
        </g>
      ))}
      <path d="M50 30C40 20 32 24 40 32C32 26 34 38 50 32ZM50 30C60 20 68 24 60 32C68 26 66 38 50 32Z" fill="url(#macRib)" stroke="#B82F68" strokeWidth=".5" />
      <circle cx="50" cy="31" r="4" fill="url(#macRib)" />
    </svg>
  );
}

/** 💝 Plush Heart — velvet pile, tufted dimples, stitched seam, satin bow */
export function PlushHeartSvg({ size = 120 }: { size?: number }) {
  const H = "M50 86C22 70 10 50 10 36C10 20 20 10 32 10C38 10 44 14 50 20C56 14 62 10 68 10C80 10 90 20 90 36C90 50 78 70 50 86Z";
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="Plush heart">
      <defs>
        <radialGradient id="heartG" cx="36%" cy="28%" r="75%"><stop offset="0" stopColor="#FFA6C4" /><stop offset=".5" stopColor="#EE3D6E" /><stop offset="1" stopColor="#9C1238" /></radialGradient>
        <radialGradient id="heartD"><stop offset="0" stopColor="#6A0A28" stopOpacity=".55" /><stop offset="1" stopColor="#6A0A28" stopOpacity="0" /></radialGradient>
        <filter id="hpile" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="2" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G" /></filter>
      </defs>
      <ellipse cx="50" cy="93" rx="34" ry="5" fill="#000" opacity=".14" />
      <g filter="url(#hpile)"><path d={H} fill="url(#heartG)" /></g>
      {[[34, 28], [66, 28], [50, 44], [36, 52], [64, 52], [50, 68]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="5.5" fill="url(#heartD)" /><circle cx={x} cy={y} r="1.3" fill="#7A0F2E" /></g>)}
      <path d={H} fill="none" stroke="#FFC4D6" strokeWidth="1.4" strokeDasharray="4 3" opacity=".55" transform="translate(50 46) scale(.93) translate(-50 -46)" />
      <ellipse cx="34" cy="24" rx="12" ry="7" fill="#fff" opacity=".32" transform="rotate(-25 34 24)" />
      <path d="M50 22C42 12 34 14 40 22C34 16 36 26 50 22ZM50 22C58 12 66 14 60 22C66 16 64 26 50 22Z" fill="#FFD6E6" stroke="#E58AAB" strokeWidth=".5" />
      <circle cx="50" cy="21" r="3.6" fill="#fff" stroke="#E58AAB" strokeWidth=".4" />
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