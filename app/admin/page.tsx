import { requireOwner } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

async function count(table: string) {
  const supabase = await createClient();
  const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function AdminOverview() {
  await requireOwner();
  const tables = ["flowers", "bouquets", "letters", "memories", "surprises"];
  const counts = await Promise.all(tables.map(count));
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="font-serif text-3xl text-rose">Overview</h1>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/bouquets" className="rounded-xl bg-primary px-5 py-3 text-white transition hover:bg-primary/90">
          Create New Bouquet
        </Link>
        <Link href="/admin/letters" className="rounded-xl bg-primary px-5 py-3 text-white transition hover:bg-primary/90">
          Write a Letter
        </Link>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {tables.map((t, i) => (
          <li key={t} className="rounded-2xl bg-white p-4 ring-1 ring-blush">
            <p className="text-2xl text-primary">{counts[i]}</p><p className="text-sm capitalize text-mute">{t}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
