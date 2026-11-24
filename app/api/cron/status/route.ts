import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/cron/status
 * Public debug endpoint — shows pending scheduled emails and cron config.
 * Remove or protect this route after debugging.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createAdminClient();

  const { data: pending, error } = await admin
    .from("scheduled_emails")
    .select("id, bouquet_id, sender_name, scheduled_at, sent_at, error, attempts")
    .order("scheduled_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    now_utc: new Date().toISOString(),
    smtp_user: process.env.SMTP_USER || "NOT SET",
    smtp_host: process.env.SMTP_HOST || "NOT SET",
    recipient_email: process.env.RECIPIENT_EMAIL || "NOT SET",
    cron_secret_set: !!process.env.CRON_SECRET,
    site_url: process.env.NEXT_PUBLIC_SITE_URL || "NOT SET",
    pending_jobs: error ? `DB error: ${error.message}` : pending,
  });
}
