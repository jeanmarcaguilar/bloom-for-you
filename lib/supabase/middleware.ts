import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/login", "/unauthorized", "/auth/callback"];

export async function updateSession(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const path = req.nextUrl.pathname;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      if (!PUBLIC.some((p) => path.startsWith(p))) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      return res;
    }

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list: { name: string; value: string; options?: any }[]) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    });

    // getUser() validates the JWT with Supabase
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user && !PUBLIC.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return res;
  } catch (err) {
    console.error("Middleware session error:", err);
    if (!PUBLIC.some((p) => path.startsWith(p))) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return res;
  }
}
