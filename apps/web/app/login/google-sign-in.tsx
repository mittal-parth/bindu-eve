"use client";

import { createBrowserSupabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function GoogleSignIn() {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  const signIn = async () => {
    setError(undefined);
    setPending(true);
    try {
      const supabase = createBrowserSupabase();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (signInError) {
        setError(signInError.message);
        setPending(false);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google sign-in failed.");
      setPending(false);
    }
  };

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-3">
      <Button className="w-full" disabled={pending} onClick={() => void signIn()} type="button">
        {pending ? "Redirecting…" : "Continue with Google"}
      </Button>
      {error ? <p className="text-center text-destructive text-sm">{error}</p> : null}
    </div>
  );
}
