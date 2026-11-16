"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Silky horizontal row:
 *  - frame-rate independent easing (same feel on 60/120/144 Hz screens)
 *  - mouse wheel -> eased sideways scroll
 *  - mouse drag with inertia (keeps gliding after release)
 *  - background animations pause while scrolling so every frame goes to the row
 *  - touch / trackpad keep native momentum
 */
const TAU = 110;        // ms. Higher = floatier/smoother, lower = snappier
const WHEEL_SPEED = 1.15;

export default function SmoothRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;

    let target = el.scrollLeft;
    let pos = el.scrollLeft;
    let raf = 0, running = false, last = 0, idle = 0;
    const max = () => Math.max(0, el.scrollWidth - el.clientWidth);
    const clamp = (v: number) => Math.max(0, Math.min(max(), v));

    // while scrolling, freeze every animation in the row (CSS + SVG/SMIL) so the
    // browser only has to move already-painted bouquets
    let scrolling = false;
    const setScrolling = (v: boolean) => {
      if (v === scrolling) return;
      scrolling = v;
      if (v) root.dataset.scrolling = "1"; else delete root.dataset.scrolling;
      el.querySelectorAll("svg").forEach((s) => {
        try { if (v) s.pauseAnimations(); else s.unpauseAnimations(); } catch { /* ignore */ }
      });
    };
    const flagScrolling = () => {
      setScrolling(true);
      clearTimeout(idle);
      idle = window.setTimeout(() => setScrolling(false), 160);
    };

    // bouquets that are off-screen stop painting and animating completely
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        const li = en.target as HTMLElement;
        if (en.isIntersecting) li.removeAttribute("data-off"); else li.setAttribute("data-off", "");
      }),
      { root: el, rootMargin: "0px 320px" }
    );
    Array.from(el.children).forEach((c) => io.observe(c));

    const tick = (t: number) => {
      const dt = Math.min(48, t - (last || t));
      last = t;
      const d = target - pos;
      if (Math.abs(d) < 0.3) {
        pos = target;
        el.scrollLeft = pos;
        running = false; last = 0;
        return;
      }
      pos += d * (1 - Math.exp(-dt / TAU)); // exponential smoothing
      el.scrollLeft = pos;
      flagScrolling();
      raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!running) {
        running = true;
        pos = el.scrollLeft;
        raf = requestAnimationFrame(tick);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || max() <= 0) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // trackpad sideways: native
      e.preventDefault();
      const dy = (e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY) * WHEEL_SPEED;
      if (!running) target = el.scrollLeft;
      target = clamp(target + dy);
      kick();
    };

    // mouse drag + inertia
    let down = false, moved = false, startX = 0, startL = 0, lastX = 0, lastT = 0, vel = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; startX = lastX = e.clientX; startL = el.scrollLeft; lastT = performance.now(); vel = 0;
      target = pos = startL;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; el.style.cursor = "grabbing"; }
      if (!moved) return;
      const now = performance.now();
      vel = (lastX - e.clientX) / Math.max(1, now - lastT); // px/ms, positive = scroll right
      lastX = e.clientX; lastT = now;
      target = clamp(startL - dx);
      kick();
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.style.cursor = "";
      if (moved && performance.now() - lastT < 80) {
        target = clamp(target + vel * 260); // glide a little further
        kick();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    };
    const noDrag = (e: DragEvent) => e.preventDefault();
    const onNativeScroll = () => { if (!running) { target = pos = el.scrollLeft; flagScrolling(); } };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("dragstart", noDrag);
    el.addEventListener("scroll", onNativeScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      io.disconnect();
      setScrolling(false);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("dragstart", noDrag);
      el.removeEventListener("scroll", onNativeScroll);
    };
  }, []);

  return <ul ref={ref} className={className}>{children}</ul>;
}