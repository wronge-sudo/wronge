"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/env";
import { buttonClass } from "@/components/ui/button";

const input = "h-12 w-full rounded-xl border-2 border-line bg-paper px-4 outline-none transition focus:border-ink";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const denied = params.get("denied") === "1";
  const next = params.get("next");
  const target = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";

  if (!isSupabaseConfigured || params.get("setup") === "1") {
    return (
      <p className="mt-6 rounded-2xl bg-signal/10 p-4 text-sm text-signal">
        The database isn&apos;t connected yet. Add the Supabase keys to the environment variables, then reload this page.
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const f = new FormData(e.currentTarget);
    const { error } = await createBrowserSupabase().auth.signInWithPassword({
      email: String(f.get("email")).trim(),
      password: String(f.get("password")),
    });
    if (error) {
      setBusy(false);
      setError(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
      return;
    }
    router.replace(target);
    router.refresh();
  }

  async function signOut() {
    await createBrowserSupabase().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <>
      {denied && (
        <div className="mt-6 rounded-2xl bg-signal/10 p-4 text-sm text-signal">
          You&apos;re signed in, but this account isn&apos;t an admin.{" "}
          <button type="button" onClick={signOut} className="font-bold underline">Sign out</button>
        </div>
      )}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Email</span>
          <input name="email" type="email" required autoComplete="username" className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Password</span>
          <input name="password" type="password" required autoComplete="current-password" className={input} />
        </label>
        {error && <p className="text-sm font-semibold text-signal" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className={buttonClass("ink", "lg", "w-full")}>
          {busy && <Loader2 className="size-4 animate-spin" />} Sign in
        </button>
      </form>
    </>
  );
}
