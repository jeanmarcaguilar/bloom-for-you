import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "owner" | "recipient";

/** Verified user + role read from the database (RLS lets users read only their own profile). */
export async function getSessionUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).single();
    if (!profile) return null;
    return { id: user.id, email: user.email ?? "", role: profile.role as Role, displayName: profile.display_name as string };
  } catch (err) {
    console.error("getSessionUser error:", err);
    return null;
  }
}

export async function requireUser() {
  const u = await getSessionUser();
  if (!u) redirect("/login");
  return u;
}

/** Call at the top of every admin page AND every admin server action. */
export async function requireOwner() {
  const u = await requireUser();
  if (u.role !== "owner") redirect("/unauthorized");
  return u;
}
