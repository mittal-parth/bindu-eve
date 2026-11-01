import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function supabaseEnv(): { readonly url: string; readonly publishableKey: string } | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return undefined;
  return { url, publishableKey };
}

let browserClient: SupabaseClient | undefined;

export function createBrowserSupabase(): SupabaseClient {
  const env = supabaseEnv();
  if (!env) {
    throw new Error("Supabase is not configured.");
  }
  browserClient ??= createBrowserClient(env.url, env.publishableKey, {
    cookies: { encode: "tokens-only" },
  });
  return browserClient;
}
