import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import FlowerSvg from "@/components/flowers/FlowerSvg";

export const metadata = { title: "Flower Garden · Bloom for You" };

export default async function Garden() {
  await requireUser();
  const supabase = await createClient();
  const { data: flowers, error } = await supabase.from("flowers").select("id, title, flower_type, color").eq("status", "published").order("created_at", { ascending: false });
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/home" className="text-sm text-mute underline">← Home</Link>
      <h1 className="mt-4 font-serif text-3xl text-rose">Our Garden</h1>
      {error && <p role="alert" className="mt-6 text-rose">The garden couldn't load. Please try again.</p>}
      {!error && !flowers?.length && <p className="mt-8 text-mute">No flowers have bloomed yet. Come back soon ♡</p>}
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {flowers?.map((f) => (
          <li key={f.id}>
            <Link href={`/garden/${f.id}`} className="flex flex-col items-center rounded-2xl bg-white p-4 ring-1 ring-blush transition hover:shadow-md hover:-translate-y-0.5 focus-visible:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <FlowerSvg type={f.flower_type} color={f.color} size={96} />
              <span className="mt-2 text-center font-serif text-ink">{f.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
