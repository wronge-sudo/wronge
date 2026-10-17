import { Star } from "lucide-react";
import { getAdminReviews } from "@/lib/admin-data";
import { cn, formatDate } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { ReviewActions } from "@/components/admin/row-actions";

export const metadata = { title: "Reviews" };
export const instant = false;

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();
  const waiting = reviews.filter((r) => !r.is_approved).length;

  return (
    <>
      <PageHeader title="Reviews" description={`${waiting} waiting for approval · Only approved reviews appear on the site. Featured ones show on the home page.`} />
      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet">Customers can write one on the Reviews page.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className={cn("rounded-2xl border bg-white p-5", r.is_approved ? "border-line/80" : "border-amber-300 ring-2 ring-amber-100")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={i < r.rating ? "size-4 fill-ink text-ink" : "size-4 text-line"} />
                      ))}
                    </span>
                    {!r.is_approved && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-amber-900">Waiting</span>}
                  </div>
                  {r.title && <p className="mt-2 font-bold">{r.title}</p>}
                </div>
                <ReviewActions id={r.id} approved={r.is_approved} featured={r.is_featured} />
              </div>
              <p className="mt-2 text-sm leading-relaxed">{r.body}</p>
              <p className="mt-3 text-xs text-muted">
                <strong className="text-ink">{r.name}</strong>
                {r.location && ` · ${r.location}`}
                {r.panel_name && ` · Panel: ${r.panel_name}`}
                {r.order_number && <> · Order <span className="font-mono">{r.order_number}</span></>}
                {` · ${formatDate(r.created_at, true)}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
