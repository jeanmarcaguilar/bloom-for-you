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

/* ---------- Email design tokens (cyan palette) ---------- */
const C = {
  page: "#ecfeff", //   soft aqua page background
  card: "#ffffff",
  border: "#a5f3fc", // pale cyan outline
  band: "#cffafe", //   header band (fallback colour for gradient)
  bandEdge: "#a5f3fc",
  accent: "#22d3ee", // main cyan, used for the button
  accentDeep: "#0891b2", // links / small details
  ink: "#083344", //    deep teal for headings + button text
  body: "#355e69", //   body copy
  muted: "#547a85", //  fine print
};
const SERIF = "Georgia,'Times New Roman',serif";

/** Email-safe (table based, inline styles) HTML for the notification. */
function renderHtml({ hello, from, link, site }: { hello: string; from: string; link: string; site: string }) {
  // Images live in /public/email and must be reachable over public https (not localhost) for real inboxes.
  // Using GitHub raw URLs as fallback for reliable image delivery
  const bgUrl = "https://raw.githubusercontent.com/jeanmarcaguilar/bloom-for-you/main/public/email/bouquet-bg.jpg";
  const flowerUrl = "https://raw.githubusercontent.com/jeanmarcaguilar/bloom-for-you/main/public/email/bouquet-flower.png";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>A new bouquet just bloomed for you</title>
</head>
<body style="margin:0;padding:0;background:${C.page};">
  <!-- Inbox preview text -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${C.page};">
    ${esc(from)} made something for you. Tap to see it.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    background="${bgUrl}" bgcolor="${C.page}"
    style="background-color:${C.page};background-image:url('${bgUrl}');background-size:cover;background-position:center top;background-repeat:no-repeat;">
    <tr>
      <td align="center" style="padding:48px 16px 56px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:480px;background:${C.card};border:1px solid ${C.border};border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(8,51,68,0.22);">

          <!-- Header band with 3D flower -->
          <tr>
            <td align="center" bgcolor="${C.band}"
              style="padding:34px 24px 26px;background:${C.band};background-image:linear-gradient(180deg,#f2feff 0%,${C.band} 100%);">
              <img src="${flowerUrl}" width="230" alt="💐" style="display:block;width:230px;max-width:70%;height:auto;border:0;font-size:60px;line-height:1;">
              <p style="margin:12px 0 0;font-family:${SERIF};font-size:15px;letter-spacing:6px;color:${C.accentDeep};">
                ✦ &nbsp;✧&nbsp; ✦
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td align="center" style="padding:36px 28px 8px;font-family:${SERIF};">
              <h1 style="margin:0 0 20px;font-family:${SERIF};font-size:28px;line-height:1.25;font-weight:normal;color:${C.ink};">
                A new bouquet<br>has bloomed for you
              </h1>
              <p style="margin:0 0 6px;font-family:${SERIF};font-size:16px;line-height:1.7;color:${C.body};">${hello}</p>
              <p style="margin:0 0 30px;font-family:${SERIF};font-size:16px;line-height:1.7;color:${C.body};">
                <strong style="color:${C.ink};">${esc(from)}</strong> made a surprise bouquet just for you. Tap below to see it ♡
              </p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td align="center" style="padding:0 36px 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="${C.accent}" style="border-radius:999px;background:${C.accent};">
                    <a href="${link}"
                      style="display:inline-block;padding:14px 36px;font-family:${SERIF};font-size:16px;font-weight:bold;color:${C.ink};text-decoration:none;border-radius:999px;">
                      Open your bouquet ♡
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td style="padding:0 36px;">
              <div style="height:1px;line-height:1px;font-size:1px;border-top:1px dashed ${C.border};">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 36px 30px;font-family:${SERIF};font-size:12px;line-height:1.7;color:${C.muted};">
              If the button doesn't work, copy this link:<br>
              <a href="${link}" style="color:${C.accentDeep};text-decoration:underline;word-break:break-all;">${link}</a>
            </td>
          </tr>
        </table>

        <p style="margin:22px 0 0;font-family:${SERIF};font-size:13px;color:${C.ink};">Made with love ♡</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
    const html = renderHtml({ hello, from, link, site });
    const text = `${r.name ? `Hi ${r.name},` : "Hi,"}\n\n${from} made a surprise bouquet just for you.\n\nOpen it here: ${link}\n`;

    await sendMail({ to: r.email, subject, html, text });
  }
}