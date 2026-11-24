"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BOUQUET_TYPES, QUANTITIES, WRAPS, RIBBONS, parseAccessories } from "@/lib/bouquet";
import { notifyRecipientNewBouquet } from "@/lib/email/bouquet-notification";

const vals = <T extends readonly { value: string }[]>(a: T) => a.map((x) => x.value) as [string, ...string[]];
const schema = z.object({
  title: z.string().trim().min(1, "Please add a title.").max(120),
  gift_message: z.string().trim().min(1, "Please write your letter/message.").max(5000),
  flower_type: z.enum(vals(BOUQUET_TYPES)),
  quantity: z.coerce.number().refine((n) => (QUANTITIES as readonly number[]).includes(n), "Pick a quantity."),
  flower_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Pick a valid color."),
  wrapping_style: z.enum(vals(WRAPS)),
  ribbon_style: z.enum(vals(RIBBONS)),
  dedication: z.string().trim().max(300).transform((v) => v || null),
  event_date: z.string().trim().transform((v) => v || null).pipe(z.string().date().nullable()),
  // Exact moment (UTC ISO) built in the browser from the date + time the sender picked,
  // so the sender's own timezone (e.g. Asia/Manila) is respected, not the server's.
  scheduled_at: z.string().trim().optional().transform((v) => v || null).pipe(z.string().datetime().nullable()),
  accessory: z.string().optional().default("none"),
  letter_category: z.string().optional().default("love_note"),
  letter_signature: z.string().optional().default("Forever yours ♡"),
  create_letter: z.string().optional(),
});
export type BouquetState = { error?: string; success?: boolean; message?: string; sentAt?: string; scheduledAt?: string | null };

export async function createBouquet(_: BouquetState, form: FormData): Promise<BouquetState> {
  const owner = await requireOwner();
  const sentAt = new Date().toISOString(); // the real moment the sender pressed "send"
  const rawData = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === "string"));
  const p = schema.safeParse(rawData);
  if (!p.success) return { error: p.error.issues[0].message };
  const d = p.data;
  // Always visible to the recipient right away (no draft option).
  const status = "published" as const;
  // Several accessories are saved as one comma-separated text, e.g. "teddy_bear,blue_butterflies".
  const accessory = parseAccessories(d.accessory).join(",") || "none";
  const supabase = await createClient();

  const flowerItems = [{
    type: d.flower_type,
    qty: d.quantity,
    color: d.flower_color,
    accessory: accessory,
  }];

  let { data: bq, error } = await supabase.from("bouquets").insert({
    owner_id: owner.id, title: d.title, gift_message: d.gift_message, status: status,
    published_at: status === "published" ? new Date().toISOString() : null,
    flower_type: d.flower_type, quantity: d.quantity, flower_color: d.flower_color,
    wrapping_style: d.wrapping_style, ribbon_style: d.ribbon_style, dedication: d.dedication, event_date: d.event_date,
    flower_items: flowerItems,
    wrapping_color: WRAPS.find((w) => w.value === d.wrapping_style)!.a,
    ribbon_color: RIBBONS.find((r) => r.value === d.ribbon_style)!.color,
  }).select("id").maybeSingle();

  if (error && (d.flower_type.startsWith("peony") || !["rose", "tulip", "sunflower", "lily", "carnation", "mixed"].includes(d.flower_type))) {
    // Graceful fallback if database constraint hasn't been updated yet with 0003_add_peony.sql
    const fallback = await supabase.from("bouquets").insert({
      owner_id: owner.id, title: d.title, gift_message: d.gift_message, status: status,
      published_at: status === "published" ? new Date().toISOString() : null,
      flower_type: "rose", quantity: d.quantity, flower_color: d.flower_color,
      wrapping_style: d.wrapping_style, ribbon_style: d.ribbon_style, dedication: d.dedication, event_date: d.event_date,
      flower_items: flowerItems,
      wrapping_color: WRAPS.find((w) => w.value === d.wrapping_style)!.a,
      ribbon_color: RIBBONS.find((r) => r.value === d.ribbon_style)!.color,
    }).select("id").maybeSingle();
    if (!fallback.error) {
      error = null;
      bq = fallback.data;
    }
  }

  if (error) return { error: "Couldn't save the bouquet. Did you run 0002_bouquet_fields.sql?" };

  // Also save the message as a Love Letter in the letters table
  const saveAsLetter = d.create_letter !== "false";
  let letterSaved = false;
  if (saveAsLetter) {
    const preview = d.gift_message.length > 140
      ? d.gift_message.slice(0, 137).trim() + "…"
      : d.gift_message;

    const { error: letterError } = await supabase.from("letters").insert({
      owner_id: owner.id,
      title: d.title,
      preview: preview,
      body: d.gift_message,
      category: d.letter_category || "love_note",
      signature: d.letter_signature || (d.dedication ? `With love, ${d.dedication}` : "Forever yours ♡"),
      status: status,
      scheduled_at: d.scheduled_at ?? (d.event_date ? new Date(d.event_date).toISOString() : sentAt),
    });
    if (!letterError) letterSaved = true;
  }

  // ── Email / scheduled email ──────────────────────────────────────────────
  // If the sender picked a future time → enqueue a scheduled_emails job.
  // If no time (or time is now / in the past) → send immediately.
  let emailSent = false;
  let emailScheduled = false;

  if (bq?.id && status === "published") {
    const scheduledMs = d.scheduled_at ? new Date(d.scheduled_at).getTime() : 0;
    const nowMs = Date.now();
    const isFuture = scheduledMs > nowMs + 30_000; // >30 s ahead = "scheduled"

    if (isFuture) {
      // Enqueue for the cron job to pick up at the right time.
      // Must use admin client — scheduled_emails has RLS enabled with no user policies.
      try {
        const admin = createAdminClient();
        const { error: qErr } = await admin.from("scheduled_emails").insert({
          bouquet_id: bq.id,
          sender_name: owner.displayName,
          scheduled_at: d.scheduled_at,
        });
        if (qErr) throw qErr;
        emailScheduled = true;
      } catch (err) {
        console.error("Failed to queue scheduled email:", err);
      }
    } else {
      // Send right now (no scheduled_at, or time already passed)
      try {
        await notifyRecipientNewBouquet({
          bouquetId: bq.id,
          senderName: owner.displayName,
        });
        emailSent = true;
      } catch (err) {
        console.error("Bouquet email notification failed:", err);
      }
    }
  }

  revalidatePath("/bouquets");
  revalidatePath("/letters");
  revalidatePath("/admin");
  revalidatePath("/home");

  const emailMsg = emailSent
    ? " Email notification sent ♡"
    : emailScheduled
    ? ` Email scheduled for ${new Date(d.scheduled_at!).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} ♡`
    : " (Email notification could not be sent.)";

  return {
    success: true,
    sentAt,
    scheduledAt: d.scheduled_at,
    message:
      (letterSaved
        ? "Bouquet and Love Letter created together beautifully!"
        : "Bouquet saved successfully!") + emailMsg,
  };
}