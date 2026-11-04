import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import FlowerSvg from "@/components/flowers/FlowerSvg";

export default async function FlowerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const supabase = await createClient();
  // RLS hides drafts from the recipient; the owner can preview any status.
  const { data: f } = await supabase.from("flowers").select("*").eq("id", id).maybeSingle();
  if (!f) notFound();
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-12 text-center">
      <Link href="/garden" className="self-start text-sm text-mute underline">← Back to the garden</Link>
      <div className="mt-6"><FlowerSvg type={f.flower_type} color={f.color} size={200} animate /></div>
      <h1 className="rise mt-4 font-serif text-3xl text-rose" style={{ animationDelay: ".7s" }}>{f.title}</h1>
      {f.event_date && <p className="rise mt-1 text-sm text-mute" style={{ animationDelay: ".8s" }}>{new Date(f.event_date).toLocaleDateString(undefined, { dateStyle: "long" })}</p>}
      <p className="rise mt-6 whitespace-pre-wrap leading-relaxed" style={{ animationDelay: ".9s" }}>{f.message}</p>
      {f.dedication && <p className="rise mt-6 italic text-mute" style={{ animationDelay: "1s" }}>{f.dedication}</p>}
    </main>
  );
}
