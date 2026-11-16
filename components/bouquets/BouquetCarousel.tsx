"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";

export type CarouselItem = { id: string; title: string; art: ReactNode };

/* All motion is transform/opacity only, so it runs on the GPU and stays smooth. */
const CSS = `
.bc{--w:clamp(158px,23.5vh,258px)}
.bc-stage{position:relative;height:calc(var(--w)*1.2 + 5.6rem)}
.bc-card{position:absolute;left:50%;bottom:calc(var(--w)*.107);width:var(--w);margin-left:calc(var(--w)/-2);
  transform-origin:50% 100%;
  transform:translate3d(calc(var(--tx,0)*var(--w) + var(--dx,0px)),calc(var(--ty,0)*var(--w)),0) rotate(var(--rot,0deg)) scale(var(--s,1));backface-visibility:hidden;
  opacity:var(--a,1);
  transition:transform .85s cubic-bezier(.22,1,.36,1),opacity .6s ease;will-change:transform,opacity}
.bc-stage.is-drag .bc-card{transition:none}
.bc-stage.is-drag{cursor:grabbing}
/* soft contact shadow under every card */
.bc-card::after{content:"";position:absolute;left:12%;right:12%;bottom:-14px;height:20px;pointer-events:none;
  background:radial-gradient(closest-side,rgba(8,145,178,.3),transparent)}
/* wide spacing + a gentle fan: sides sit lower and lean outward */
.bc-card[data-o="0"]{--s:1;z-index:3}
.bc-card[data-o="1"]{--tx:1.27;--ty:.045;--rot:3deg;--s:.8;--a:.92;z-index:2}
.bc-card[data-o="-1"]{--tx:-1.27;--ty:.045;--rot:-3deg;--s:.8;--a:.92;z-index:2}
.bc-card[data-o="2"]{--tx:2.32;--ty:.125;--rot:6deg;--s:.7;--a:.5;z-index:1}
.bc-card[data-o="-2"]{--tx:-2.32;--ty:.125;--rot:-6deg;--s:.7;--a:.5;z-index:1}
.bc-card[data-o="far"]{--tx:calc(var(--o)*1.16);--ty:.18;--s:.62;--a:0;visibility:hidden;pointer-events:none}
@media (max-width:640px){
  .bc-card[data-o="1"]{--tx:1.16}.bc-card[data-o="-1"]{--tx:-1.16}
  .bc-card[data-o="2"],.bc-card[data-o="-2"]{--a:0;visibility:hidden;pointer-events:none}}
.bc-glass{position:relative;display:block;border-radius:2rem;padding:.6rem;
  background:linear-gradient(to bottom,rgba(255,255,255,.62),rgba(255,255,255,.3) 55%,rgba(255,255,255,.16));
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.85),0 22px 36px -22px rgba(8,145,178,.6)}
/* glow fades in/out (opacity only, so it animates on the GPU) */
.bc-glass::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .7s ease;
  box-shadow:0 0 34px 6px rgba(255,255,255,.75),0 0 26px rgba(244,114,182,.3)}
.bc-card[data-o="0"] .bc-glass::before{opacity:1}
@media (prefers-reduced-motion:reduce){.bc-card{transition-duration:.01ms}}
`;

export default function BouquetCarousel({ items, titleClass = "" }: { items: CarouselItem[]; titleClass?: string }) {
  const n = items.length;
  const [active, setActive] = useState(0);
  const [favs, setFavs] = useState<string[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, down: false, on: false, dx: 0 });
  const dragged = useRef(false);
  const lastWheel = useRef(0);

  const calm = useRef(0);
  const pauseDecor = useCallback(() => {
    const root = document.documentElement;
    root.dataset.moving = "1";
    window.clearTimeout(calm.current);
    calm.current = window.setTimeout(() => delete root.dataset.moving, 950);
  }, []);
  useEffect(() => { pauseDecor(); }, [active, pauseDecor]);
  useEffect(() => () => { window.clearTimeout(calm.current); delete document.documentElement.dataset.moving; }, []);

  const go = useCallback((d: number) => setActive((a) => Math.max(0, Math.min(n - 1, a + d))), [n]);

  useEffect(() => {
    try { const raw = localStorage.getItem("bfy-favs"); if (raw) setFavs(JSON.parse(raw)); } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "ArrowRight") go(1); else if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [go]);

  const toggleFav = (id: string) =>
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem("bfy-favs", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });

  const onWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheel.current < 450) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 8) return;
    lastWheel.current = now;
    go(d > 0 ? 1 : -1);
  };

  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, down: true, on: false, dx: 0 };
    dragged.current = false;
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down) return;
    let dx = e.clientX - d.x;
    if (!d.on && Math.abs(dx) > 6) {
      d.on = true;
      stageRef.current?.classList.add("is-drag");
      pauseDecor();
      try { stageRef.current?.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    }
    if (!d.on) return;
    d.dx = dx;
    if ((dx > 0 && active === 0) || (dx < 0 && active === n - 1)) dx *= 0.3; // rubber-band at the ends
    stageRef.current?.style.setProperty("--dx", `${dx}px`);
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    const el = stageRef.current;
    if (d.on) {
      dragged.current = true;
      try { el?.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      el?.classList.remove("is-drag");
      el?.style.setProperty("--dx", "0px");
      if (Math.abs(d.dx) > 45) go(d.dx < 0 ? 1 : -1);
    }
    d.on = false;
  };

  const arrow = "absolute top-[42%] z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/75 text-cyan-950 shadow-md ring-1 ring-white transition hover:bg-white active:scale-95 disabled:opacity-35 sm:h-12 sm:w-12";

  return (
    <section className="bc relative w-screen shrink-0 self-center" aria-roledescription="carousel" aria-label="Bouquets">
      <style>{CSS}</style>

      <div
        ref={stageRef}
        className="bc-stage touch-pan-y select-none"
        onWheel={onWheel}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {/* glowing podium */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-[calc(var(--w)*.27)] w-[calc(var(--w)*1.6)] -translate-x-1/2" aria-hidden>
          <div className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-white/70 to-cyan-200/60 shadow-[0_16px_30px_-10px_rgba(8,145,178,0.55)] ring-1 ring-white/80" />
          <div className="absolute inset-x-[7%] top-[6%] h-[68%] rounded-[50%] bg-white/55 shadow-[0_0_26px_6px_rgba(244,114,182,0.4)] ring-2 ring-pink-300/80" />
        </div>

        {items.map((it, i) => {
          const o = i - active;
          const isActive = o === 0;
          return (
            <div key={it.id} className="bc-card" data-o={Math.abs(o) > 2 ? "far" : o} style={{ "--o": o } as CSSProperties}>
              <div className="relative">
                <span
                  aria-hidden={!isActive}
                  className={`pointer-events-none absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-pink-400 to-rose-500 px-3 py-0.5 text-[11px] font-medium text-white shadow-md transition duration-500 ${isActive ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
                >
                  Most Loved <Heart size={10} aria-hidden />
                </span>
                <button
                  type="button"
                  onClick={() => toggleFav(it.id)}
                  aria-label={favs.includes(it.id) ? "Remove from favorites" : "Add to favorites"}
                  aria-pressed={favs.includes(it.id)}
                  className="absolute right-3.5 top-3.5 z-10 grid h-8 w-8 place-items-center rounded-full transition active:scale-90"
                >
                  <Heart size={17} className={favs.includes(it.id) ? "fill-pink-500 text-pink-500" : "text-cyan-900/45"} aria-hidden />
                </button>

                <Link
                  href={`/bouquets/${it.id}`}
                  draggable={false}
                  tabIndex={isActive ? 0 : -1}
                  onClick={(e) => {
                    if (dragged.current) { e.preventDefault(); dragged.current = false; return; }
                    if (!isActive) { e.preventDefault(); setActive(i); }
                  }}
                  className="bc-glass group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                >
                  <div className="relative flex h-[calc(var(--w)*1.08)] justify-center [&>svg]:h-full [&>svg]:w-auto">{it.art}</div>
                  <div className="mt-2 flex items-center gap-2 rounded-full bg-white/80 py-1.5 pl-3.5 pr-1.5 shadow-[0_6px_14px_-8px_rgba(8,145,178,0.5)] ring-1 ring-white">
                    <Heart size={11} className="shrink-0 fill-pink-500 text-pink-500" aria-hidden />
                    <span className={`${titleClass} flex-1 truncate text-center text-[13px] font-medium text-cyan-950 sm:text-sm`}>{it.title}</span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-rose-600 text-white shadow-md transition group-hover:translate-x-0.5" aria-hidden>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <div className="mt-1 flex justify-center gap-1.5" role="group" aria-label="Choose a bouquet">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show bouquet ${i + 1}`}
              aria-current={i === active}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-5 bg-pink-500" : "w-1.5 bg-white/90 hover:bg-pink-300"}`}
            />
          ))}
        </div>
      )}

      {n > 1 && (
        <>
          <button type="button" className={`${arrow} left-[2.5vw]`} onClick={() => go(-1)} disabled={active === 0} aria-label="Previous bouquet"><ArrowLeft size={20} aria-hidden /></button>
          <button type="button" className={`${arrow} right-[2.5vw]`} onClick={() => go(1)} disabled={active === n - 1} aria-label="Next bouquet"><ArrowRight size={20} aria-hidden /></button>
        </>
      )}
      <p className="sr-only" aria-live="polite">Bouquet {active + 1} of {n}: {items[active]?.title}</p>
    </section>
  );
}