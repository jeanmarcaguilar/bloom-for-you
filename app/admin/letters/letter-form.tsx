"use client";

import { useActionState } from "react";
import { createLetter, LetterState } from "./actions";
import Link from "next/link";

const categories = [
  { value: "just_because", label: "Just Because" },
  { value: "love_note", label: "Love Note" },
  { value: "good_morning", label: "Good Morning" },
  { value: "good_night", label: "Good Night" },
  { value: "apology", label: "Apology" },
  { value: "gratitude", label: "Gratitude" },
  { value: "milestone", label: "Milestone" },
  { value: "thinking_of_you", label: "Thinking of You" },
  { value: "custom", label: "Custom" },
];

export default function LetterForm() {
  const [state, action, pending] = useActionState<LetterState, FormData>(createLetter, {});

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin" className="text-sm text-mute underline">← Back to Admin</Link>
      <h1 className="mt-4 font-serif text-3xl text-rose">Write a New Letter</h1>

      {state.success && (
        <div className="mt-4 rounded-xl bg-green-50 p-4 text-green-800">
          {state.message}
        </div>
      )}

      {state.message && !state.success && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-800">
          {state.message}
        </div>
      )}

      <form action={action} className="mt-6 space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-blush">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-ink">Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={160}
            className="mt-1 w-full rounded-xl border border-blush bg-white px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="e.g., My dearest love"
          />
          {state.errors?.title && (
            <p className="mt-1 text-sm text-rose">{state.errors.title[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-ink">Category *</label>
          <select
            id="category"
            name="category"
            required
            className="mt-1 w-full rounded-xl border border-blush bg-white px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {state.errors?.category && (
            <p className="mt-1 text-sm text-rose">{state.errors.category[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="preview" className="block text-sm font-medium text-ink">Preview (optional)</label>
          <input
            id="preview"
            name="preview"
            type="text"
            maxLength={300}
            className="mt-1 w-full rounded-xl border border-blush bg-white px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="A short teaser shown on the letters list…"
          />
          {state.errors?.preview && (
            <p className="mt-1 text-sm text-rose">{state.errors.preview[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-ink">Letter Body *</label>
          <textarea
            id="body"
            name="body"
            required
            rows={10}
            maxLength={20000}
            className="mt-1 w-full rounded-xl border border-blush bg-white px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Write your letter here…"
          />
          {state.errors?.body && (
            <p className="mt-1 text-sm text-rose">{state.errors.body[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="signature" className="block text-sm font-medium text-ink">Signature (optional)</label>
          <input
            id="signature"
            name="signature"
            type="text"
            maxLength={80}
            className="mt-1 w-full rounded-xl border border-blush bg-white px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="e.g., Forever yours ♡"
          />
          {state.errors?.signature && (
            <p className="mt-1 text-sm text-rose">{state.errors.signature[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-ink">Status *</label>
          <select
            id="status"
            name="status"
            required
            className="mt-1 w-full rounded-xl border border-blush bg-white px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="published">Published (visible to recipient)</option>
            <option value="draft">Draft (not visible to recipient)</option>
          </select>
          {state.errors?.status && (
            <p className="mt-1 text-sm text-rose">{state.errors.status[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-primary px-5 py-3 text-white transition hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send Letter"}
        </button>
      </form>
    </div>
  );
}

