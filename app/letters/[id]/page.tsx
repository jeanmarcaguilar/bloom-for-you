import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function LetterPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const supabase = await createClient();
  const { data: l } = await supabase.from("letters").select("title, body, signature").eq("id", id).maybeSingle();
  if (!l) notFound();
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/letters" className="text-sm text-mute underline">← All letters</Link>
      <article className="bloom mt-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-blush">
        <h1 className="font-serif text-3xl text-rose">{l.title}</h1>
        <p className="mt-6 whitespace-pre-wrap leading-relaxed">{l.body}</p>
        {l.signature && <p className="mt-8 font-serif italic text-mute">{l.signature}</p>}
      </article>
    </main>
  );
}
