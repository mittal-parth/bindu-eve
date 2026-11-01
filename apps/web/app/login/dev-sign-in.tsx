"use client";

import { createBrowserSupabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";

const isDevelopment = process.env.NODE_ENV === "development";

export function DevSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  if (!isDevelopment) return null;

  const signIn = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return;
    setError(undefined);
    setPending(true);
    try {
      const supabase = createBrowserSupabase();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setPending(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed.");
      setPending(false);
    }
  };

  return (
    <form className="flex w-full max-w-xs flex-col gap-3" onSubmit={(event) => void signIn(event)}>
      <p className="text-center text-muted-foreground text-xs tracking-wide">Development only</p>
      <label className="sr-only" htmlFor="dev-email">
        Email
      </label>
      <Input
        autoComplete="email"
        id="dev-email"
        name="email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        required
        type="email"
        value={email}
      />
      <label className="sr-only" htmlFor="dev-password">
        Password
      </label>
      <Input
        autoComplete="current-password"
        id="dev-password"
        name="password"
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        required
        type="password"
        value={password}
      />
      <Button disabled={pending || !email.trim() || !password} type="submit" variant="outline">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      {error ? <p className="text-center text-destructive text-sm">{error}</p> : null}
    </form>
  );
}
