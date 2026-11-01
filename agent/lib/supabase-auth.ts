import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { extractBearerToken, UnauthenticatedError, type AuthFn } from "eve/channels/auth";

let client: SupabaseClient | undefined;

function supabaseClient(): SupabaseClient | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return undefined;
  client ??= createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  return client;
}

/** Accept a Supabase access token. Requests without a bearer fall through. */
export function supabaseAuth(): AuthFn<Request> {
  return async (request) => {
    const token = extractBearerToken(request.headers.get("authorization"));
    if (!token) return null;

    const supabase = supabaseClient();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabase || !url) {
      throw new UnauthenticatedError({
        code: "authentication_required",
        message: "Supabase auth is not configured.",
      });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || data.user === null) {
      throw new UnauthenticatedError({
        code: "authentication_required",
        message: "Sign in to continue.",
      });
    }

    return {
      attributes: {},
      authenticator: "supabase",
      issuer: `${url.replace(/\/$/, "")}/auth/v1`,
      principalId: data.user.id,
      principalType: "user",
      subject: data.user.id,
    };
  };
}
