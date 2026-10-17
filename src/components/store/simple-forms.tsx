"use client";
import { useActionState, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { sendMessage, submitReview, type FormState } from "@/actions/public";
import { cn } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";

const input = "h-12 w-full rounded-xl border-2 border-line bg-paper px-4 outline-none transition focus:border-ink";

function Status({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p className={cn("rounded-2xl p-4 text-sm font-semibold", state.ok ? "bg-acid text-ink" : "border-2 border-signal bg-signal/10 text-signal")} role="status">
      {state.message}
    </p>
  );
}

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(sendMessage, null);
  if (state?.ok) return <Status state={state} />;
  return (
    <form action={action} className="space-y-4">
      <Status state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Name</span>
          <input name="name" required className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Phone</span>
          <input name="phone" type="tel" className={input} placeholder="01XXXXXXXXX" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Email</span>
        <input name="email" type="email" className={input} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Subject</span>
        <select name="subject" className={input} defaultValue="General question">
          {["General question", "My order", "Size exchange", "Custom panel", "Wholesale / collab", "Other"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Message</span>
        <textarea name="message" required rows={5} className={cn(input, "h-auto py-3")} />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <button type="submit" disabled={pending} className={buttonClass("ink", "lg")}>
        {pending && <Loader2 className="size-4 animate-spin" />} Send message
      </button>
    </form>
  );
}

export function ReviewForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(submitReview, null);
  const [rating, setRating] = useState(0);
  if (state?.ok) return <Status state={state} />;
  return (
    <form action={action} className="space-y-4">
      <Status state={state} />
      <div>
        <span className="mb-1.5 block text-sm font-semibold">Your rating</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} className="p-1">
              <Star className={cn("size-7 transition", n <= rating ? "fill-ink text-ink" : "text-line")} />
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Name</span>
          <input name="name" required className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">City <span className="font-normal text-muted">(optional)</span></span>
          <input name="location" className={input} placeholder="e.g. Chattogram" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Favourite panel <span className="font-normal text-muted">(optional)</span></span>
          <input name="panel_name" className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Order number <span className="font-normal text-muted">(optional)</span></span>
          <input name="order_number" className={cn(input, "font-mono uppercase")} placeholder="WR-1001" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Headline <span className="font-normal text-muted">(optional)</span></span>
        <input name="title" className={input} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Your review</span>
        <textarea name="body" required rows={4} className={cn(input, "h-auto py-3")} />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <button type="submit" disabled={pending} className={buttonClass("ink", "lg")}>
        {pending && <Loader2 className="size-4 animate-spin" />} Submit review
      </button>
    </form>
  );
}
