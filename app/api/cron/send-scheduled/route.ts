import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyRecipientNewBouquet } from "@/lib/email/bouquet-notification";

/**
 * GET  /api/cron/send-scheduled  ← called by Vercel Cron
 * POST /api/cron/send-scheduled  ← called by Supabase pg_cron via net.http_post
 *
 * Finds all scheduled_emails rows where:
 *   - sent_at IS NULL   (not yet sent)
 *   - scheduled_at <= now()  (due or overdue)
 *   - attempts < 3     (give up after 3 failures)
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleCron(request: Request) {
  // Auth: Vercel passes the secret as Authorization: Bearer <CRON_SECRET>
  // If no secret is set, allow all (useful during initial setup)
  const auth = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    console.warn("[cron] Unauthorized call — auth header:", auth);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Fetch up to 20 due jobs per run
  const { data: jobs, error } = await admin
    .from("scheduled_emails")
    .select("id, bouquet_id, sender_name, attempts")
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
    return NextResponse.json({ sent: 0, message: "Nothing due.", now_utc: now });
  }

  const results: { id: string; ok: boolean; error?: string }[] = [];

  for (const job of jobs) {
    // Increment attempts first so a crash doesn't loop forever
    await admin
      .from("scheduled_emails")
      .update({ attempts: job.attempts + 1 })
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
      console.log(`[cron] ✅ Sent email for job ${job.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[cron] ❌ Failed job ${job.id}:`, msg);

      await admin
        .from("scheduled_emails")
        .update({ error: msg })
        .eq("id", job.id);

      results.push({ id: job.id, ok: false, error: msg });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  console.log(`[cron] send-scheduled: ${sent}/${results.length} sent.`);
  return NextResponse.json({ sent, total: results.length, results, now_utc: now });
}

// Vercel Cron calls GET
export async function GET(request: Request) {
  return handleCron(request);
}

// Supabase pg_cron calls POST (net.http_post)
export async function POST(request: Request) {
  return handleCron(request);
}
