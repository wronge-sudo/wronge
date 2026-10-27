"use client";
import { useTransition } from "react";
import { Check, EyeOff, Loader2, Mail, MailOpen, Star, Trash2 } from "lucide-react";
import { deleteMessage, deleteReview, deleteSubscriber, markMessage, moderateReview } from "@/actions/admin";
import { cn } from "@/lib/format";

const btn = "inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-xs font-semibold transition hover:border-ink disabled:opacity-50";

export function ReviewActions({ id, approved, featured }: { id: string; approved: boolean; featured: boolean }) {
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<unknown>) => start(async () => void (await fn()));
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {pending && <Loader2 className="size-4 animate-spin text-muted" />}
      {approved ? (
        <button type="button" disabled={pending} className={btn} onClick={() => run(() => moderateReview(id, { is_approved: false, is_featured: false }))}>
          <EyeOff className="size-3.5" /> Hide
        </button>
      ) : (
        <button type="button" disabled={pending} className={cn(btn, "border-ink bg-ink text-paper hover:bg-primary hover:text-ink")} onClick={() => run(() => moderateReview(id, { is_approved: true }))}>
          <Check className="size-3.5" /> Approve
        </button>
      )}
      {approved && (
        <button type="button" disabled={pending} className={cn(btn, featured && "border-amber-400 bg-amber-50")} onClick={() => run(() => moderateReview(id, { is_featured: !featured }))}>
          <Star className={cn("size-3.5", featured && "fill-amber-400 text-amber-500")} /> {featured ? "Featured" : "Feature"}
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        className={cn(btn, "text-rose-700")}
        onClick={() => window.confirm("Delete this review for good?") && run(() => deleteReview(id))}
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

export function MessageActions({ id, read }: { id: string; read: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" disabled={pending} className={btn} onClick={() => start(async () => void (await markMessage(id, !read)))}>
        {read ? <Mail className="size-3.5" /> : <MailOpen className="size-3.5" />} {read ? "Mark unread" : "Mark read"}
      </button>
      <button type="button" disabled={pending} className={cn(btn, "text-rose-700")} onClick={() => window.confirm("Delete this message?") && start(async () => void (await deleteMessage(id)))}>
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

export function SubscriberDelete({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" aria-label="Remove subscriber" disabled={pending} className="rounded-full p-1.5 text-muted hover:bg-rose-50 hover:text-rose-700" onClick={() => window.confirm("Remove this email from the list?") && start(async () => void (await deleteSubscriber(id)))}>
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
    </button>
  );
}
