"use client";

import { createBrowserSupabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    window.location.assign("/login");
  };

  return (
    <Button
      className="pointer-events-auto fixed top-3 left-6"
      disabled={pending}
      onClick={() => void signOut()}
      size="sm"
      type="button"
      variant="ghost"
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
