"use client";

import { useActionState, useState } from "react";
import { createFlower, FlowerState } from "./actions";
import Link from "next/link";

const flowerTypes = [
  { value: "peony", label: "Peony" },
  { value: "rose", label: "Rose" },
  { value: "tulip", label: "Tulip" },
  { value: "sunflower", label: "Sunflower" },
  { value: "daisy", label: "Daisy" },
  { value: "lily", label: "Lily" },
  { value: "cherry_blossom", label: "Cherry Blossom" },
  { value: "lavender", label: "Lavender" },
  { value: "custom", label: "Custom" },
];

const colors = [
  "#D96C91", // Rose pink
  "#F5B82E", // Sunflower yellow
  "#FFFFFF", // White
  "#E8A87C", // Peach
  "#C38D9E", // Mauve
  "#85DCB8", // Mint
  "#E0BBE4", // Lavender
  "#FF6B6B", // Coral
  "#4ECDC4", // Teal
  "#FFE66D", // Light yellow
];

export default function FlowerForm() {
  const [state, action, pending] = useActionState<FlowerState, FormData>(createFlower, {});
  const [selectedColor, setSelectedColor] = useState("#D96C91");

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin" className="text-sm text-mute underline">← Back to Admin</Link>
      <h1 className="mt-4 font-serif text-3xl text-rose">Create a New Flower</h1>
      
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
            className="mt-1 w-full rounded-xl border border-blush bg-white px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="e.g., My First Rose"
          />
          {state.errors?.title && (
            <p className="mt-1 text-sm text-rose">{state.errors.title[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="flower_type" className="block text-sm font-medium text-ink">Flower Type *</label>
          <select
            id="flower_type"
            name="flower_type"
            required
            className="mt-1 w-full rounded-xl border border-blush bg-white px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {flowerTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {state.errors?.flower_type && (
            <p className="mt-1 text-sm text-rose">{state.errors.flower_type[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="color" className="block text-sm font-medium text-ink">Color *</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`h-10 w-10 rounded-full border-2 transition hover:scale-110 ${
                  selectedColor === color ? "border-primary ring-2 ring-primary/30" : "border-blush"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <input
            id="color"
            name="color"
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            required
            className="mt-2 h-10 w-full rounded-xl border border-blush bg-white"
          />
          {state.errors?.color && (
            <p className="mt-1 text-sm text-rose">{state.errors.color[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-ink">Message *</label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            maxLength={5000}
            className="mt-1 w-full rounded-xl border border-blush bg-white px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Write your heartfelt message here..."
          />
          {state.errors?.message && (
            <p className="mt-1 text-sm text-rose">{state.errors.message[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="dedication" className="block text-sm font-medium text-ink">Dedication (optional)</label>
          <input
            id="dedication"
            name="dedication"
            type="text"
            maxLength={300}
            className="mt-1 w-full rounded-xl border border-blush bg-white px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="e.g., For you, my love"
          />
          {state.errors?.dedication && (
            <p className="mt-1 text-sm text-rose">{state.errors.dedication[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="event_date" className="block text-sm font-medium text-ink">Event Date (optional)</label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            className="mt-1 w-full rounded-xl border border-blush bg-white px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {state.errors?.event_date && (
            <p className="mt-1 text-sm text-rose">{state.errors.event_date[0]}</p>
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
          {pending ? "Creating..." : "Create Flower"}
        </button>
      </form>
    </div>
  );
}
