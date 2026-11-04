"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Music, VolumeX } from "lucide-react";

type Props = {
  /** audio file inside /public, e.g. "/music/home.mp3" */
  src: string;
  /** 0 – 1 */
  volume?: number;
  /** colour of the little button */
  tone?: "pink" | "cyan";
};

const KEY = "bfy-music";

/**
 * Loops a song while this page is open and shows a small round button to mute / unmute.
 * Browsers block sound until the visitor interacts, so if autoplay is refused
 * the music starts on the first click, tap or key press instead.
 */
export default function MusicPlayer({ src, volume = 0.35, tone = "pink" }: Props) {
  const cyan = tone === "cyan";
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wantRef = useRef(true); // does the visitor want music? (saved choice)
  const [playing, setPlaying] = useState(false);
  const [missing, setMissing] = useState(false);

  const fadeTo = useCallback((target: number, ms: number, done?: () => void) => {
    const a = audioRef.current;
    if (!a) return;
    if (fadeRef.current) clearInterval(fadeRef.current);
    const from = a.volume;
    const steps = Math.max(1, Math.round(ms / 50));
    let i = 0;
    fadeRef.current = setInterval(() => {
      i++;
      a.volume = Math.min(1, Math.max(0, from + ((target - from) * i) / steps));
      if (i >= steps) { clearInterval(fadeRef.current!); fadeRef.current = null; done?.(); }
    }, 50);
  }, []);

  const start = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return false;
    try {
      a.volume = 0;
      await a.play();
      setPlaying(true);
      fadeTo(volume, 1800);
      return true;
    } catch {
      return false; // autoplay refused – wait for a gesture
    }
  }, [fadeTo, volume]);

  const stop = useCallback(() => {
    fadeTo(0, 400, () => audioRef.current?.pause());
    setPlaying(false);
  }, [fadeTo]);

  useEffect(() => {
    try { wantRef.current = localStorage.getItem(KEY) !== "off"; } catch {}
    if (!wantRef.current) return;

    let cancelled = false;
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    const onGesture = async () => {
      if (cancelled || !wantRef.current) return;
      if (await start()) events.forEach((e) => window.removeEventListener(e, onGesture));
    };
    start().then((ok) => {
      if (!ok && !cancelled) events.forEach((e) => window.addEventListener(e, onGesture));
    });

    // be polite: pause when the tab is hidden, resume when it comes back
    const onVis = () => {
      const a = audioRef.current;
      if (!a || !wantRef.current) return;
      if (document.hidden) a.pause();
      else if (a.currentTime > 0) a.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      events.forEach((e) => window.removeEventListener(e, onGesture));
      document.removeEventListener("visibilitychange", onVis);
      if (fadeRef.current) clearInterval(fadeRef.current);
      audioRef.current?.pause();
    };
  }, [start]);

  const toggle = async () => {
    if (playing) {
      wantRef.current = false;
      try { localStorage.setItem(KEY, "off"); } catch {}
      stop();
    } else {
      wantRef.current = true;
      try { localStorage.setItem(KEY, "on"); } catch {}
      await start();
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" onError={() => setMissing(true)} />
      {!missing && (
        <button
          onClick={toggle}
          aria-label={playing ? "Mute music" : "Play music"}
          aria-pressed={playing}
          className={`group fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white bg-white/75 shadow-lg backdrop-blur ${cyan ? "text-cyan-700 shadow-cyan-500/25" : "text-rose shadow-primary/25"} transition hover:scale-110 hover:bg-white active:scale-95`}
        >
          {playing && <span className={`absolute inset-0 animate-ping rounded-full ${cyan ? "bg-cyan-400/30" : "bg-primary/25"}`} aria-hidden />}
          {playing ? <Music size={20} className="relative" /> : <VolumeX size={20} className="relative text-mute" />}
        </button>
      )}
    </>
  );
}