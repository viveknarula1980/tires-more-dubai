import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/admin/import",
    message: typeof s.message === "string" ? s.message : "",
  }),
  head: () => ({
    meta: [
      { title: "Sign in" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function normalizeRedirect(rawRedirect?: string) {
  try {
    const url = new URL(rawRedirect || "/admin/import", window.location.origin);
    if (url.origin !== window.location.origin) return "/admin/import";
    return `${url.pathname}${url.search}${url.hash}` || "/admin/import";
  } catch {
    const dest = rawRedirect || "/admin/import";
    if (!dest.startsWith("/") || dest.startsWith("//")) return "/admin/import";
    return dest;
  }
}

async function waitForStoredSession() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Signed in, but the browser session was not stored. Please try again.");
}

function LoginPage() {
  const { redirect, message } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const dest = normalizeRedirect(redirect);

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + dest },
        });
        if (error) throw error;
        setError("Check your email to confirm your account.");
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.session) throw new Error("No session returned. Try again.");
        await waitForStoredSession();
        // Hard-navigate so route guards re-evaluate with the fresh stored session.
        window.location.replace(dest);
        return;
      }
    } catch (e) {
      console.error("Login error:", e);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Admin access is required for the tire import tools.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {(error || message) && <p className="text-sm text-destructive">{error || message}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-muted-foreground underline"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
          {mode === "signin" && (
            <Link to="/forgot-password" className="text-muted-foreground underline">
              Forgot password?
            </Link>
          )}
        </div>

        <div className="mt-6 text-xs text-muted-foreground">
          <Link to="/" className="underline">
            Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
}
