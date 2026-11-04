"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { nicknameSchema } from "@/lib/validation/auth";

export type LoginState = { error?: string };

const NOT_FOUND = "Hmm, that nickname isn't right. Try again ♡";
const FAILED = "Something went wrong. Please try again.";

export async function signInWithNickname(_: LoginState, form: FormData): Promise<LoginState> {
  const parsed = nicknameSchema.safeParse({ nickname: form.get("nickname") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const admin = createAdminClient();

    const { data: row, error: pErr } = await admin
      .from("login_nicknames").select("user_id")
      .eq("nickname", parsed.data.nickname).maybeSingle();
    if (pErr) { console.error("STEP 1 nickname lookup:", pErr.message); return { error: FAILED }; }
    if (!row) return { error: NOT_FOUND };

    const { data: u, error: uErr } = await admin.auth.admin.getUserById(row.user_id);
    if (uErr || !u.user?.email) { console.error("STEP 2 getUserById:", uErr?.message); return { error: NOT_FOUND }; }

    const { data: link, error: lErr } = await admin.auth.admin.generateLink({ type: "magiclink", email: u.user.email });
    if (lErr || !link.properties?.hashed_token) { console.error("STEP 3 generateLink:", lErr?.message); return { error: FAILED }; }

    const supabase = await createClient();
    const { error: vErr } = await supabase.auth.verifyOtp({ type: "email", token_hash: link.properties.hashed_token });
    if (vErr) { console.error("STEP 4 verifyOtp:", vErr.message); return { error: FAILED }; }
  } catch (err) {
    console.error("STEP 0 exception:", err);
    return { error: FAILED };
  }
  redirect("/home");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}