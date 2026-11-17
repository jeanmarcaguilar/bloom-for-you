import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Redirect to /home if authenticated, otherwise to /login
export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  } else {
    redirect("/login");
  }
}