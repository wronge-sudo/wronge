import { Download } from "lucide-react";
import { getMessages } from "@/lib/admin-data";
import { cn, formatDate } from "@/lib/format";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { MessageActions, SubscriberDelete } from "@/components/admin/row-actions";

export const metadata = { title: "Messages" };
export const instant = false;

export default async function MessagesPage() {
  const { messages, subscribers, subscriberCount } = await getMessages();
  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <>
      <PageHeader title="Messages" description={`${unread} unread · from the Contact page`} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          {messages.length === 0 ? (
            <EmptyState title="No messages yet" />
          ) : (
            messages.map((m) => (
              <article key={m.id} className={cn("rounded-2xl border bg-white p-5", m.is_read ? "border-line/80" : "border-ink")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">
                      {!m.is_read && <span className="mr-2 inline-block size-2 rounded-full bg-signal align-middle" />}
                      {m.name}
                      {m.subject && <span className="font-normal text-muted"> · {m.subject}</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {m.phone && <a href={`tel:${m.phone}`} className="font-mono hover:underline">{m.phone}</a>}
                      {m.phone && m.email && " · "}
                      {m.email && <a href={`mailto:${m.email}`} className="hover:underline">{m.email}</a>}
                      {` · ${formatDate(m.created_at, true)}`}
                    </p>
                  </div>
                  <MessageActions id={m.id} read={m.is_read} />
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">{m.message}</p>
              </article>
            ))
          )}
        </div>
        <Card
          title={`Newsletter (${subscriberCount})`}
          padded={false}
          action={
            subscriberCount > 0 && (
              <a href="/api/admin/export?type=subscribers" className="inline-flex items-center gap-1 text-xs font-bold underline underline-offset-2">
                <Download className="size-3.5" /> CSV
              </a>
            )
          }
        >
          {subscribers.length === 0 ? (
            <p className="p-5 text-sm text-muted">No sign-ups yet.</p>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-line/60 overflow-y-auto">
              {subscribers.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 px-5 py-2.5 text-sm">
                  <span className="min-w-0 truncate">{s.email}</span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted">
                    {formatDate(s.created_at)} <SubscriberDelete id={s.id} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
