import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import BouquetSvg from "@/components/bouquets/BouquetSvg";

export const metadata = { title: "Bouquets · Bloom for You" };
export default async function Bouquets() {
  await requireUser();
  const { data, error } = await (await createClient()).from("bouquets").select("id, title, flower_type, flower_items, quantity, flower_color, wrapping_style, ribbon_style, dedication").eq("status", "published").order("created_at", { ascending: false });
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/home" className="text-sm text-mute underline">← Home</Link>
      <h1 className="mt-4 font-serif text-3xl text-rose">Bouquets for You</h1>
      {error && <p role="alert" className="mt-6 text-rose">Bouquets couldn't load. Please try again.</p>}
      {!error && !data?.length && <p className="mt-8 text-mute">No bouquets have arrived yet. Come back soon ♡</p>}
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {data?.map((b) => (
          <li key={b.id}>
            <Link href={`/bouquets/${b.id}`} className="flex flex-col items-center rounded-2xl bg-white p-4 ring-1 ring-blush transition hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <BouquetSvg type={(b.flower_items as any)?.[0]?.type || b.flower_type} count={b.quantity} color={b.flower_color} wrap={b.wrapping_style} ribbon={b.ribbon_style} tag={b.dedication || "For you"} size={140} />
              <span className="mt-2 text-center font-serif text-ink">{b.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
