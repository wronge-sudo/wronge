"use client";
import { useActionState } from "react";
import { subscribe, type FormState } from "@/actions/public";
import { cn } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";

export function NewsletterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe, null);

  return (
    <form action={action} className="w-full">
      <div className="flex items-center gap-2">
        <label htmlFor="nl-email" className="sr-only">Email address</label>
        <input
          id="nl-email"
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          className="h-11 min-w-0 flex-1 rounded-[8px] border border-ink/20 bg-paper-2 px-3.5 text-[1rem] text-ink outline-none placeholder:text-ink/45 focus:border-ink"
        />
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button
          type="submit"
          disabled={pending}
          className={buttonClass("outline", "md", "px-5")}
        >
          {pending ? "…" : "Join →"}
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
