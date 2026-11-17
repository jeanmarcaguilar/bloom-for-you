"use client";
import { useActionState } from "react";
import { User, Heart, ArrowRight } from "lucide-react";
import { signInWithNickname, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signInWithNickname, {});
  return (
    <form
      action={action}
      className="relative mx-auto mt-6 w-full max-w-[32rem] space-y-4 overflow-hidden rounded-[2rem] border-2 border-white/60 bg-gradient-to-b from-white/45 to-white/20 p-5 text-left shadow-[0_24px_50px_-18px_rgba(10,100,125,0.5),inset_0_0_36px_rgba(255,255,255,0.35)] backdrop-blur-xl sm:mt-8 sm:space-y-5 sm:rounded-[2.5rem] sm:px-12 sm:pb-7 sm:pt-9"
    >
      {/* soft top highlight for a glassy edge */}
      <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" aria-hidden />

      <label className="block">
        <span className="text-sm font-medium text-[#0b6b82] sm:text-base">Your nickname</span>
        <span className="relative mt-2 block">
          <span className="pointer-events-none absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm">
            <User size={18} className="fill-cyan-600 text-cyan-600" aria-hidden />
          </span>
          <input
            name="nickname"
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={40}
            placeholder="Type it here…"
            className="w-full rounded-full border border-white/90 bg-white/75 py-3.5 pl-14 pr-5 text-base text-cyan-950 shadow-inner shadow-cyan-900/5 outline-none transition placeholder:text-cyan-900/40 focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-300/80"
          />
        </span>
      </label>

      {state.error && (
        <p role="alert" className="rounded-full bg-red-50/80 px-3 py-1.5 text-center text-xs text-red-600 sm:text-sm">
          {state.error}
        </p>
      )}

      <button
        disabled={pending}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#1aa6c2] via-[#0e90ad] to-[#0a7a96] px-5 py-3.5 text-base font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_22px_-8px_rgba(8,120,150,0.65)] transition hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_14px_26px_-8px_rgba(8,120,150,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white/60 active:scale-[0.98] disabled:opacity-60"
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full motion-reduce:hidden" aria-hidden />
        <span className="relative">{pending ? "Opening…" : "Come in"}</span>
        {!pending && <ArrowRight size={16} className="relative transition group-hover:translate-x-0.5" aria-hidden />}
      </button>

      <div className="flex items-center gap-3 text-xs text-[#0b6b82]/70" aria-hidden>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#0b6b82]/30" />
        or
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#0b6b82]/30" />
      </div>

      <p className="font-playfair text-center text-sm italic text-[#0b6b82] sm:text-[0.95rem]">
        Made with love, one little moment at a time. <Heart size={14} className="ml-1 inline align-[-2px]" aria-hidden />
      </p>
    </form>
  );
}