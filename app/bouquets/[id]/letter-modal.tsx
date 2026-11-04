"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Heart, Mail, X } from "lucide-react";


const hand = { className: "font-caveat" };

type Props = { greeting: string; message: string; dedication?: string | null; title: string };

const FALL = [
  { l: "8%", d: 0, t: 11, s: 18 }, { l: "22%", d: 3, t: 13, s: 14 }, { l: "38%", d: 6, t: 10, s: 20 },
  { l: "55%", d: 1.5, t: 12, s: 16 }, { l: "70%", d: 4.5, t: 14, s: 22 }, { l: "86%", d: 2, t: 11, s: 15 },
];

/* Every line of the paper is 36px tall. Text and ruled lines share this number so they stay aligned. */
const LINE = 36;

export default function LetterModal({ greeting, message, dedication, title }: Props) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const skipRef = useRef(false);

  const segs = useMemo(() => {
    const list = [greeting, message, dedication ? `— ${dedication}` : ""];
    let start = 0;
    return list.map((text) => { const seg = { text, start }; start += text.length; return seg; });
  }, [greeting, message, dedication]);
  const full = segs.map((s) => s.text).join("");
  const total = full.length;
  const done = typed >= total;

  /* open / close housekeeping */
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  /* typing effect: types the letter out letter by letter, pausing a little at punctuation */
  useEffect(() => {
    if (!open) return;
    skipRef.current = false;
    setTyped(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setTyped(total); return; }
    const base = Math.max(14, Math.min(48, 9000 / Math.max(total, 1)));
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (skipRef.current) return;
      i++;
      setTyped(i);
      if (i >= total) return;
      const ch = full[i - 1];
      const extra = ".!?".includes(ch) ? 280 : ch === "," ? 130 : ch === "\n" ? 220 : 0;
      timer = setTimeout(tick, base + extra);
    };
    timer = setTimeout(tick, 700); // wait for the note to finish sliding in
    return () => clearTimeout(timer);
  }, [open, full, total]);

  /* keep the pen in view if the letter is long */
  useEffect(() => { if (open && !done) caretRef.current?.scrollIntoView({ block: "nearest" }); }, [typed, open, done]);

  const skip = () => { skipRef.current = true; setTyped(total); };

  const renderSeg = (i: number) => {
    const { text, start } = segs[i];
    const t = Math.max(0, Math.min(text.length, typed - start));
    const writing = !done && typed >= start && typed < start + text.length;
    return (
      <>
        {text.slice(0, t)}
        {writing && <span ref={caretRef} className="mx-px inline-block h-[0.8em] w-[2px] translate-y-[2px] animate-[bfy-blink_.8s_steps(1)_infinite] rounded-full bg-cyan-600 align-baseline" aria-hidden />}
        <span className="opacity-0">{text.slice(t)}</span>
      </>
    );
  };

  const tape = "absolute z-20 h-7 w-24 rounded-sm border border-dashed border-white/70 bg-cyan-300/50 shadow-sm backdrop-blur-sm";

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-700/35 via-cyan-400/25 to-cyan-800/40 p-4 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <style>{`
        @keyframes bfy-note{from{opacity:0;transform:translateY(40px) scale(.9) rotate(-3deg)}to{opacity:1;transform:none}}
        @keyframes bfy-fall{0%{transform:translateY(-12vh) rotate(0);opacity:0}10%{opacity:.85}100%{transform:translateY(112vh) rotate(380deg);opacity:.2}}
        @keyframes bfy-beat{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
        @keyframes bfy-blink{0%,100%{opacity:1}50%{opacity:0}}
      `}</style>

      {FALL.map((p, i) => (
        <svg key={i} viewBox="0 0 20 34" width={p.s} className="pointer-events-none absolute top-0" style={{ left: p.l, animation: `bfy-fall ${p.t}s linear ${p.d}s infinite` }} aria-hidden>
          <path d="M10 0C22 6 22 24 10 34 -2 24 -2 6 10 0Z" fill="#a5f3fc" />
        </svg>
      ))}

      <div className="relative w-[min(92vw,30rem)]" style={{ animation: "bfy-note .5s cubic-bezier(.2,.9,.25,1.1)" }}>
        {/* two pieces of washi tape pinning the note */}
        <div className={`${tape} -left-5 -top-2 -rotate-[38deg]`} aria-hidden />
        <div className={`${tape} -right-5 -top-2 rotate-[38deg]`} aria-hidden />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Letter: ${title}`}
          className="relative flex max-h-[82vh] flex-col overflow-hidden rounded-[28px] bg-[#fffbf1] shadow-[0_30px_80px_-20px_rgba(14,116,144,0.55)] ring-1 ring-white/80"
          style={{ backgroundImage: "radial-gradient(circle at 15% 10%, rgba(255,255,255,.9), transparent 45%), radial-gradient(circle at 90% 95%, rgba(207,250,254,.7), transparent 50%)" }}
        >
          <button
            ref={closeRef}
            onClick={() => setOpen(false)}
            aria-label="Close letter"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/70 p-1.5 text-mute shadow-sm transition hover:rotate-90 hover:bg-white hover:text-cyan-700"
          >
            <X size={18} />
          </button>

          {/* ruled paper: lines sit right under each line of handwriting */}
          <div
            onClick={() => !done && skip()}
            title={done ? undefined : "Tap to show the whole letter"}
            className={`${hand.className} flex-1 overflow-y-auto overflow-x-hidden pb-6 pl-16 pr-7 pt-10 ${done ? "" : "cursor-pointer"}`}
            style={{
              backgroundImage:
                `linear-gradient(to right, transparent 51px, rgba(6,182,212,0.38) 51px, rgba(6,182,212,0.38) 52px, transparent 52px), repeating-linear-gradient(to bottom, transparent 0, transparent ${LINE - 1}px, rgba(6,182,212,0.26) ${LINE - 1}px, rgba(6,182,212,0.26) ${LINE}px)`,
              backgroundAttachment: "local, local",
              backgroundPosition: "0 0, 0 -4px",
              fontSize: 27,
              lineHeight: `${LINE}px`,
            }}
          >
            <p className="flex items-center gap-2 pr-10 font-bold text-ink [overflow-wrap:anywhere]" style={{ fontSize: 30, lineHeight: `${LINE}px` }}>
              <span>{renderSeg(0)}</span>
            </p>
            <p className="whitespace-pre-wrap font-medium text-ink/90 [overflow-wrap:anywhere]" style={{ marginTop: LINE }}>{renderSeg(1)}</p>
            {dedication && (
              <p className="whitespace-pre-wrap text-right font-bold text-cyan-700 [overflow-wrap:anywhere]" style={{ marginTop: LINE, fontSize: 29 }}>{renderSeg(2)}</p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-cyan-200 bg-white/50 px-7 py-3">
            <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-mute">
              <span className="h-px w-6 bg-cyan-400/60" aria-hidden /> Made with love
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white shadow-md ring-2 ring-white" style={{ animation: "bfy-beat 1.8s ease-in-out infinite" }} aria-hidden>
              <Heart size={15} className="fill-white" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-7 py-3 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
      >
        <Mail size={16} className="transition group-hover:rotate-[-8deg]" aria-hidden /> Read my letter
      </button>
      {open && createPortal(modal, document.body)}
    </>
  );
}