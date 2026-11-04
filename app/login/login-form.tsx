"use client";
import { useActionState } from "react";
import { Heart, ArrowRight } from "lucide-react";
import { signInWithNickname, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signInWithNickname, {});
  return (
    <form action={action} className="mt-8 space-y-4 rounded-[2rem] border border-white/70 bg-white/55 p-6 text-left shadow-xl shadow-cyan-900/10 backdrop-blur-xl sm:p-8">
      <label className="block text-sm font-medium text-cyan-900">
        Your nickname
        <span className="relative mt-2 block">
          <Heart size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 fill-cyan-500 text-cyan-500" aria-hidden />
          <input
            name="nickname" type="text" autoComplete="off" autoCapitalize="none" spellCheck={false} required maxLength={40}
            placeholder="Type it here…"
            className="w-full rounded-full border border-white bg-white/80 py-3 pl-11 pr-4 text-cyan-950 shadow-sm outline-none placeholder:text-cyan-900/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300"
          />
        </span>
      </label>

      {state.error && <p role="alert" className="text-center text-sm text-red-600">{state.error}</p>}

      <button
        disabled={pending}
        className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-700 px-6 py-3 font-medium text-white shadow-md shadow-cyan-700/30 transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-60"
      >
        {pending ? "Opening…" : "Come in"}
        {!pending && <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden />}
      </button>
    </form>
  );
}