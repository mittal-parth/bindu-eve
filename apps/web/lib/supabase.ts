import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

function supabaseEnv(): { readonly url: string; readonly publishableKey: string } | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return undefined;
  return { url, publishableKey };
}

export async function createServerSupabase() {
  const env = supabaseEnv();
  if (!env) {
    throw new Error("Supabase is not configured.");
  }
  const cookieStore = await cookies();
  const cookieMethods: CookieMethodsServer = {
    encode: "tokens-only",
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      } catch {
        // Server Components cannot set cookies. The proxy refreshes the session.
      }
    },
  };
  return createServerClient(env.url, env.publishableKey, { cookies: cookieMethods });
}

function requiresSignIn(pathname: string): boolean {
  return pathname === "/" || pathname === "/s" || pathname.startsWith("/s/");
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const env = supabaseEnv();
  const pathname = request.nextUrl.pathname;

  if (!env) {
    if (!requiresSignIn(pathname)) return response;
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "error=config";
    return NextResponse.redirect(login);
  }

  const cookieMethods: CookieMethodsServer = {
    encode: "tokens-only",
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet, headers) {
      for (const { name, value } of cookiesToSet) {
        request.cookies.set(name, value);
      }
      response = NextResponse.next({ request });
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(name, value, options);
      }
      for (const [name, value] of Object.entries(headers)) {
        response.headers.set(name, value);
      }
    },
  };

  const supabase = createServerClient(env.url, env.publishableKey, { cookies: cookieMethods });
  // getClaims() verifies the token and refreshes it. getUser() is a network call
  // and writes the full user record back into the cookie.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user && requiresSignIn(pathname)) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    return withSessionCookies(response, NextResponse.redirect(login));
  }

  if (user && pathname === "/login") {
    const home = request.nextUrl.clone();
    home.pathname = "/";
    home.search = "";
    return withSessionCookies(response, NextResponse.redirect(home));
  }

  return response;
}

function withSessionCookies(source: NextResponse, target: NextResponse): NextResponse {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) target.headers.set(header, value);
  }
  return target;
}
