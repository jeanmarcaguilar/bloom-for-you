"use server";

import { z } from "zod";
import { requireOwner } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const letterSchema = z.object({
  title: z.string().min(1).max(160),
  preview: z.string().max(300).optional(),
  body: z.string().min(1).max(20000),
  category: z.string().min(1).max(80),
  signature: z.string().max(80).optional(),
  status: z.enum(["draft", "published"]),
});

export type LetterState = {
  errors?: {
    title?: string[];
    preview?: string[];
    body?: string[];
    category?: string[];
    signature?: string[];
    status?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function createLetter(_: LetterState, form: FormData): Promise<LetterState> {
  await requireOwner();
  const supabase = await createClient();

  const parsed = letterSchema.safeParse({
    title: form.get("title"),
    preview: form.get("preview") || "",
    body: form.get("body"),
    category: form.get("category"),
    signature: form.get("signature") || "",
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

  const { error } = await supabase.from("letters").insert({
    owner_id: user.id,
    title: parsed.data.title,
    preview: parsed.data.preview || null,
    body: parsed.data.body,
    category: parsed.data.category,
    signature: parsed.data.signature || null,
    status: parsed.data.status,
  });

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/letters");
  revalidatePath("/admin");
  return { success: true, message: "Letter created successfully!" };
}

