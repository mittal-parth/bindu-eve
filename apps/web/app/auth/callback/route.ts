import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const login = new URL("/login", url.origin);
  login.searchParams.set("error", "auth");
  if (!code) return redirectWithoutStore(login);

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return redirectWithoutStore(login);

  return redirectWithoutStore(new URL("/", url.origin));
}

function redirectWithoutStore(url: URL): NextResponse {
  const response = NextResponse.redirect(url);
  response.headers.set("cache-control", "private, no-store");
  return response;
}
