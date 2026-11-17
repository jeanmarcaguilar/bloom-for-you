import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/login", "/unauthorized", "/auth/callback"];
const STATIC = ["/_next", "/favicon", "/icon", "/static"];

export async function updateSession(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const path = req.nextUrl.pathname;

  // Skip auth check for static assets and public routes
  if (STATIC.some((p) => path.startsWith(p)) || PUBLIC.some((p) => path.startsWith(p))) {
    return res;
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return NextResponse.redirect(new URL("/login", req.url));
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
    const { data, error } = await supabase.auth.getUser();
    const user = data?.user;

    // If refresh token is invalid, clear the auth cookies
    if (error && error.code === 'refresh_token_not_found') {
      res.cookies.delete('sb-access-token');
      res.cookies.delete('sb-refresh-token');
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return res;
  } catch (err) {
    // Clear cookies on any auth error to prevent retry loops
    res.cookies.delete('sb-access-token');
    res.cookies.delete('sb-refresh-token');
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
