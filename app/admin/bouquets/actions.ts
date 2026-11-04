"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
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
  accessory: z.string().optional().default("none"),
  letter_category: z.string().optional().default("love_note"),
  letter_signature: z.string().optional().default("Forever yours ♡"),
  create_letter: z.string().optional(),
});
export type BouquetState = { error?: string; success?: boolean; message?: string };

export async function createBouquet(_: BouquetState, form: FormData): Promise<BouquetState> {
  const owner = await requireOwner();
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
      scheduled_at: d.event_date ? new Date(d.event_date).toISOString() : (status === "published" ? new Date().toISOString() : null),
    });
    if (!letterError) letterSaved = true;
  }

  // Email the recipient. A mail failure must never break bouquet creation.
  let emailSent = false;
  if (bq?.id && status === "published") {
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

  revalidatePath("/bouquets");
  revalidatePath("/letters");
  revalidatePath("/admin");
  revalidatePath("/home");

  return {
    success: true,
    message:
      (letterSaved
        ? "Bouquet and Love Letter created together beautifully!"
        : "Bouquet saved successfully!") +
      (emailSent ? " Email notification sent ♡" : " (Email notification could not be sent.)"),
  };
}