import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Love Letters · Bloom for You" };
const label = (c: string) => c.replace(/_/g, " ").replace(/^\w/, (m) => m.toUpperCase());

export default async function Letters({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser();
  const { q } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("letters").select("id, title, preview, category").order("created_at", { ascending: false });
  const term = q?.trim().slice(0, 60).replace(/[%,()]/g, "");
  if (term) query = query.or(`title.ilike.%${term}%,preview.ilike.%${term}%`);
  const { data: letters, error } = await query;
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/home" className="text-sm text-mute underline">← Home</Link>
      <h1 className="mt-4 font-serif text-3xl text-rose">Your Letters</h1>
      <form className="mt-4"><input name="q" defaultValue={q} placeholder="Search letters" aria-label="Search letters" className="w-full rounded-xl border border-blush bg-white px-4 py-2" /></form>
      {error && <p role="alert" className="mt-6 text-rose">Letters couldn't load. Please try again.</p>}
      {!error && !letters?.length && <p className="mt-8 text-mute">No letters are waiting for you yet ♡</p>}
      <ul className="mt-6 space-y-3">
        {letters?.map((l) => (
          <li key={l.id}>
            <Link href={`/letters/${l.id}`} className="block rounded-2xl bg-white p-5 ring-1 ring-blush transition hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <p className="text-xs uppercase tracking-widest text-primary">✉ {label(l.category)}</p>
              <p className="mt-1 font-serif text-xl text-ink">{l.title}</p>
              {l.preview && <p className="mt-1 text-sm text-mute">{l.preview}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
