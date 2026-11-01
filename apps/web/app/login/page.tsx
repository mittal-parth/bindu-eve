import { DevSignIn } from "./dev-sign-in";
import { GoogleSignIn } from "./google-sign-in";

export default async function LoginPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly error?: string }>;
}) {
  const { error } = await searchParams;
  const message =
    error === "config"
      ? "Supabase is not configured for this app."
      : error === "auth"
        ? "Google sign-in did not finish. Try again."
        : undefined;

  return (
    <main className="flex h-dvh flex-col items-center justify-center gap-8 bg-background px-6 text-foreground">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-medium text-5xl tracking-tighter">Bindu</h1>
        <p className="text-muted-foreground text-sm">Sign in to chat.</p>
      </div>
      <GoogleSignIn />
      {process.env.NODE_ENV === "development" ? <DevSignIn /> : null}
      {message ? <p className="max-w-xs text-center text-destructive text-sm">{message}</p> : null}
    </main>
  );
}
