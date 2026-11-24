import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyRecipientNewBouquet } from "@/lib/email/bouquet-notification";

/**
 * GET /api/cron/send-scheduled
 *
 * Called by Vercel Cron every minute (see vercel.json).
 * Finds all scheduled_emails rows where:
 *   - sent_at IS NULL   (not yet sent)
 *   - scheduled_at <= now()  (due or overdue)
 *   - attempts < 3     (give up after 3 failures)
 *
 * Protected by CRON_SECRET so random callers can't trigger it.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // ── Auth: Vercel passes the secret as Authorization: Bearer <CRON_SECRET>
  const auth = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Fetch up to 20 due jobs per run (keeps each invocation fast)
  const { data: jobs, error } = await admin
    .from("scheduled_emails")
    .select("id, bouquet_id, sender_name")
    .is("sent_at", null)
    .lte("scheduled_at", now)
    .lt("attempts", 3)
    .order("scheduled_at", { ascending: true })
    .limit(20);

  if (error) {
    console.error("[cron] scheduled_emails fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!jobs?.length) {
    return NextResponse.json({ sent: 0, message: "Nothing due." });
  }

  const results: { id: string; ok: boolean; error?: string }[] = [];

  for (const job of jobs) {
    // Increment attempts first so a crash doesn't loop forever
    await admin
      .from("scheduled_emails")
      .update({ attempts: (job as any).attempts + 1 })
      .eq("id", job.id);

    try {
      await notifyRecipientNewBouquet({
        bouquetId: job.bouquet_id,
        senderName: job.sender_name,
      });

      await admin
        .from("scheduled_emails")
        .update({ sent_at: new Date().toISOString(), error: null })
        .eq("id", job.id);

      results.push({ id: job.id, ok: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[cron] Failed to send job ${job.id}:`, msg);

      await admin
        .from("scheduled_emails")
        .update({ error: msg })
        .eq("id", job.id);

      results.push({ id: job.id, ok: false, error: msg });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  console.log(`[cron] send-scheduled: ${sent}/${results.length} sent.`);
  return NextResponse.json({ sent, total: results.length, results });
}
