"use client";
import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Heart, Sparkles } from "lucide-react";

type Item = { id: string; title: string; art: ReactNode; isNew?: boolean };

// where each card sits relative to the centred one (x is in card widths)
const SLOTS: Record<number, { x: number; y: number; s: number; rz: number; ry: number }> = {
  [-2]: { x: -1.87, y: 0.09, s: 0.68, rz: -8, ry: -14 },
  [-1]: { x: -1.05, y: 0.04, s: 0.8, rz: -5, ry: -10 },
  0: { x: 0, y: 0, s: 1, rz: 0, ry: 0 },
  1: { x: 1.05, y: 0.04, s: 0.8, rz: 5, ry: 10 },
  2: { x: 1.87, y: 0.09, s: 0.68, rz: 8, ry: 14 },
};

export default function BouquetCarousel({ items, titleClass = "", initialIndex = 0, rtl = true }: { items: Item[]; titleClass?: string; initialIndex?: number; rtl?: boolean }) {
  const n = items.length;
  const [idx, setIdx] = useState(() => Math.min(Math.max(initialIndex, 0), Math.max(n - 1, 0)));
  const [H, setH] = useState(340); // height of the centred card, fitted to the screen
  const [navigating, startNav] = useTransition();
  const router = useRouter();
  const touchX = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // prefetch visible bouquet pages so navigation is instant
  useEffect(() => {
    items.forEach((it, i) => { if (Math.abs(i - idx) <= 2) router.prefetch(`/bouquets/${it.id}`); });
  }, [idx, items, router]);

  useEffect(() => {
    const fit = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const byH = h * (w < 640 ? 0.34 : 0.37);
      const byW = w < 640 ? (w * 0.72) / 0.84 : w * 0.5;
      setH(Math.round(Math.max(220, Math.min(byH, byW, 430))));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => {
      window.removeEventListener("resize", fit);
      clearTimeout(timer.current);
      delete document.documentElement.dataset.moving;
    };
  }, []);

  // no looping: the row starts and ends, and the arrows stop at each end
  const go = useCallback(
    (d: number) => {
      const next = Math.min(Math.max(idx + d, 0), n - 1);
      if (next === idx) return;
      setIdx(next);
      document.documentElement.dataset.moving = "1"; // lets the page pause its ambient animations
      clearTimeout(timer.current);
      timer.current = setTimeout(() => delete document.documentElement.dataset.moving, 400);
    },
    [n, idx]
  );

  const goRef = useRef(go);
  goRef.current = go;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const step = rtl ? 1 : -1;
      if (e.key === "ArrowLeft") goRef.current(step);
      else if (e.key === "ArrowRight") goRef.current(-step);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rtl]);

  const W = Math.round(H * 0.84);
  const navBtn =
    "absolute z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-[#0a5c72] shadow-[0_8px_24px_-8px_rgba(11,111,138,0.5)] ring-1 ring-white transition hover:bg-white disabled:pointer-events-none disabled:opacity-35 sm:h-[62px] sm:w-[62px]";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Bouquets"
      className="relative shrink-0"
      style={{ width: "100vw", height: Math.round(H * 1.3) }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) goRef.current((dx < 0 ? 1 : -1) * (rtl ? -1 : 1));
      }}
    >
      {/* glass podium */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2" style={{ top: H * 0.93, width: W * 1.8, height: W * 0.34 }} aria-hidden>
        <span className="absolute inset-x-0 bottom-0 top-[14%] rounded-[50%] bg-gradient-to-b from-[#b9e4f1] to-[#7cc5dc] shadow-[0_26px_50px_-12px_rgba(11,111,138,0.5)]" />
        <span className="absolute inset-x-0 top-0 h-[78%] rounded-[50%] bg-gradient-to-b from-white to-[#cdeef7] shadow-[0_0_60px_rgba(255,255,255,0.9)] ring-1 ring-white" />
        <span className="absolute inset-x-[10%] top-[10%] h-[58%] rounded-[50%] bg-gradient-to-b from-[#e6f9fd] to-white ring-1 ring-cyan-200/80" />
      </div>

      {/* cards */}
      <div className="absolute inset-x-0 top-0" style={{ height: H, perspective: 1400 }}>
        {items.map((it, i) => {
          const off = i - idx;
          const visible = Math.abs(off) <= 2;
          const slot = SLOTS[Math.max(-2, Math.min(2, rtl ? -off : off))]; // right-to-left mirrors the layout
          const active = off === 0;

          const inner = (
            <>
              {it.isNew && (
                <span
                  className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-pink-400 to-pink-500 px-3 py-0.5 font-semibold uppercase tracking-wider text-white shadow-md"
                  style={{ fontSize: H * 0.04 }}
                >
                  <Sparkles size={H * 0.04} aria-hidden /> New
                </span>
              )}
              <Heart className="absolute text-[#0b6b82]/70" style={{ right: "7%", top: "5%" }} size={Math.round(H * 0.065)} aria-hidden />

              <div className="absolute left-1/2 top-[46%]" style={{ width: 230, height: 260, transform: `translate(-50%,-50%) scale(${H / 340})` }}>
                <div className="flex h-full w-full items-center justify-center">{it.art}</div>
              </div>

              <div className="absolute inset-x-[6%] bottom-[5%] flex items-center gap-[3%] rounded-full bg-white/90 pl-[5%] pr-[6%] shadow-md" style={{ height: H * 0.15 }}>
                <Heart size={Math.round(H * 0.06)} className="shrink-0 fill-pink-500 text-pink-500" aria-hidden />
                <span className={`${titleClass} min-w-0 flex-1 truncate text-left text-ink`} style={{ fontSize: H * 0.053 }}>
                  {it.title}
                </span>
              </div>
            </>
          );

          const cardCls =
            "relative block h-full w-full rounded-[2rem] border border-white/70 bg-gradient-to-b from-white/60 to-white/25 shadow-[0_18px_40px_-14px_rgba(11,111,138,0.45),inset_0_0_30px_rgba(255,255,255,0.45)] outline-none focus-visible:ring-2 focus-visible:ring-cyan-500";

          return (
            <div
              key={it.id}
              className="absolute left-1/2 top-0"
              style={{
                width: W,
                height: H,
                marginLeft: -W / 2,
                zIndex: 10 - Math.min(Math.abs(off), 5),
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? "auto" : "none",
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
                transform: `translate(${slot.x * W}px, ${slot.y * H}px) rotateY(${slot.ry}deg) rotate(${slot.rz}deg) scale(${slot.s})`,
                transition: "transform .35s cubic-bezier(.25,.8,.25,1), opacity .3s ease-out",
              }}
              aria-hidden={!visible || undefined}
            >
              {active ? (
                <button type="button" onClick={() => startNav(() => router.push(`/bouquets/${it.id}`))} className={`${cardCls} ${navigating ? "scale-95 opacity-70" : ""} transition-[transform,opacity] duration-200`} aria-label={`Open ${it.title}`}>
                  {inner}
                </button>
              ) : (
                <button type="button" tabIndex={visible ? 0 : -1} onClick={() => goRef.current(off)} className={cardCls} aria-label={`Show ${it.title}`}>
                  {inner}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <>
          <button
            type="button"
            disabled={rtl ? idx === n - 1 : idx === 0}
            onClick={() => goRef.current(rtl ? 1 : -1)}
            className={navBtn}
            style={{ left: "clamp(8px,7vw,120px)", top: H * 0.5, transform: "translateY(-50%)" }}
            aria-label={rtl ? "Newer bouquet" : "Previous bouquet"}
          >
            <ChevronLeft size={26} aria-hidden />
          </button>
          <button
            type="button"
            disabled={rtl ? idx === 0 : idx === n - 1}
            onClick={() => goRef.current(rtl ? -1 : 1)}
            className={navBtn}
            style={{ right: "clamp(8px,7vw,120px)", top: H * 0.5, transform: "translateY(-50%)" }}
            aria-label={rtl ? "Older bouquet" : "Next bouquet"}
          >
            <ChevronRight size={26} aria-hidden />
          </button>
        </>
      )}
    </section>
  );
}