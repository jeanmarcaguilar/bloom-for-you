"use client";
import { useActionState } from "react";
import { Heart, ArrowRight } from "lucide-react";
import { signInWithNickname, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signInWithNickname, {});
  return (
    <form
      action={action}
      className="relative mx-auto mt-5 w-full max-w-[19rem] space-y-3 overflow-hidden rounded-3xl bg-white/40 p-4 text-left shadow-[0_12px_40px_-12px_rgba(8,70,90,0.45)] ring-1 ring-white/80 backdrop-blur-xl sm:mt-7 sm:max-w-sm sm:space-y-4 sm:p-6"
    >
      {/* soft top highlight for a glassy edge */}
      <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" aria-hidden />

      <label className="block">
        <span className="ml-3 text-xs font-medium text-cyan-900/80 sm:text-sm">Your nickname</span>
        <span className="relative mt-1.5 block">
          <span className="pointer-events-none absolute left-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-cyan-100/90 sm:h-9 sm:w-9">
            <Heart size={14} className="fill-cyan-500 text-cyan-500" aria-hidden />
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
            className="w-full rounded-full border border-white/90 bg-white/85 py-2.5 pl-11 pr-4 text-base text-cyan-950 shadow-inner shadow-cyan-900/5 outline-none transition placeholder:text-cyan-900/35 focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-300/80 sm:py-3 sm:pl-12"
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
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 via-cyan-600 to-cyan-700 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-cyan-800/30 transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white/60 active:scale-[0.97] disabled:opacity-60 sm:py-3 sm:text-base"
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full motion-reduce:hidden" aria-hidden />
        <span className="relative">{pending ? "Opening…" : "Come in"}</span>
        {!pending && <ArrowRight size={15} className="relative transition group-hover:translate-x-0.5" aria-hidden />}
      </button>
    </form>
  );
}