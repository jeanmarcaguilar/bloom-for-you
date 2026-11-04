"use server";

import { z } from "zod";
import { requireOwner } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const flowerSchema = z.object({
  title: z.string().min(1).max(120),
  flower_type: z.enum(["peony", "rose", "tulip", "sunflower", "daisy", "lily", "cherry_blossom", "lavender", "custom"]),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  message: z.string().max(5000),
  dedication: z.string().max(300).optional(),
  event_date: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

export type FlowerState = {
  errors?: {
    title?: string[];
    flower_type?: string[];
    color?: string[];
    message?: string[];
    dedication?: string[];
    event_date?: string[];
    status?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function createFlower(_: FlowerState, form: FormData): Promise<FlowerState> {
  await requireOwner();
  const supabase = await createClient();

  const parsed = flowerSchema.safeParse({
    title: form.get("title"),
    flower_type: form.get("flower_type"),
    color: form.get("color"),
    message: form.get("message"),
    dedication: form.get("dedication") || "",
    event_date: form.get("event_date") || "",
    status: form.get("status"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Please fix the errors above.",
    };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { message: "Not authenticated" };
  }

  const { error } = await supabase.from("flowers").insert({
    owner_id: user.id,
    title: parsed.data.title,
    flower_type: parsed.data.flower_type,
    color: parsed.data.color,
    message: parsed.data.message,
    dedication: parsed.data.dedication || null,
    event_date: parsed.data.event_date || null,
    status: parsed.data.status,
  });

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/garden");
  revalidatePath("/admin");
  return { success: true, message: "Flower created successfully!" };
}
