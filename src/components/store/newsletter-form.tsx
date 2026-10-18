"use client";
import { useActionState } from "react";
import { subscribe, type FormState } from "@/actions/public";
import { cn } from "@/lib/format";

export function NewsletterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe, null);

  return (
    <form action={action} className="w-full">
      <div className="flex rounded-full border-2 border-paper/25 bg-ink p-1 focus-within:border-primary-light">
        <label htmlFor="nl-email" className="sr-only">Email address</label>
        <input
          id="nl-email"
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-paper outline-none placeholder:text-paper/40"
        />
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full bg-primary px-5 text-xs font-bold uppercase tracking-wider text-paper transition hover:bg-primary-hover disabled:opacity-60"
        >
          {pending ? "…" : "Join"}
        </button>
      </div>
      {state && (
        <p className={cn("mt-2 text-xs", state.ok ? "text-ok" : "text-signal")} role="status">
          {state.message}
        </p>
      )}
    </form>
  );
}
