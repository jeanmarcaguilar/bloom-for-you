import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/email/mailer";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Finds the recipient email address(es).
 * 1) RECIPIENT_EMAIL in .env (comma separated) wins if set.
 * 2) Otherwise every user whose profile role is 'recipient'.
 */
async function getRecipients(): Promise<{ email: string; name: string }[]> {
  const override = process.env.RECIPIENT_EMAIL?.split(",").map((e) => e.trim()).filter(Boolean);
  const admin = createAdminClient();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, display_name")
    .eq("role", "recipient");
  if (error) throw new Error(`Recipient lookup failed: ${error.message}`);

  if (override?.length) {
    const name = profiles?.[0]?.display_name || "";
    return override.map((email) => ({ email, name }));
  }

  const out: { email: string; name: string }[] = [];
  for (const p of profiles ?? []) {
    const { data, error: uErr } = await admin.auth.admin.getUserById(p.id);
    if (uErr || !data.user?.email) continue;
    out.push({ email: data.user.email, name: p.display_name || "" });
  }
  return out;
}

type Params = {
  bouquetId: string;
  senderName: string;
};

/** Emails the recipient that a new bouquet arrived. No title, dedication or letter is included, to keep it a surprise. */
export async function notifyRecipientNewBouquet({ bouquetId, senderName }: Params) {
  const recipients = await getRecipients();
  if (!recipients.length) {
    console.warn("notifyRecipientNewBouquet: no recipient email found, skipping.");
    return;
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const link = `${site}/bouquets/${bouquetId}`;
  const from = senderName || "Someone who loves you";
  const subject = `💐 A new bouquet just bloomed for you`;

  for (const r of recipients) {
    const hello = r.name ? `Hi ${esc(r.name)},` : "Hi,";
    const html = `
<div style="margin:0;padding:24px;background:#fdf2f5;font-family:Georgia,'Times New Roman',serif;color:#3b2a30;">
  <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;text-align:center;border:1px solid #f5c9d7;">
    <div style="font-size:44px;line-height:1;">💐</div>
    <h1 style="font-size:24px;margin:16px 0 8px;color:#9d174d;font-weight:normal;">A new bouquet for you</h1>
    <p style="margin:0 0 4px;font-size:16px;">${hello}</p>
    <p style="margin:0 0 24px;font-size:16px;"><strong>${esc(from)}</strong> made a surprise bouquet just for you. Tap below to see it ♡</p>
    <a href="${link}" style="display:inline-block;background:#d96c91;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:999px;font-size:16px;">Open your bouquet ♡</a>
    <p style="margin:24px 0 0;font-size:12px;color:#a08a91;">If the button doesn't work, copy this link:<br>${link}</p>
  </div>
</div>`;
    const text = `${r.name ? `Hi ${r.name},` : "Hi,"}\n\n${from} made a surprise bouquet just for you.\n\nOpen it here: ${link}\n`;

    await sendMail({ to: r.email, subject, html, text });
  }
}