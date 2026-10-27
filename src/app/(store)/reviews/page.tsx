import type { Metadata } from "next";
import { Star } from "lucide-react";
import { getApprovedReviews } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { Container, PageHero } from "@/components/ui/section";
import { ReviewForm } from "@/components/store/simple-forms";

export const metadata: Metadata = {
  title: "Reviews",
  description: "What people say about their Wronge jacket and art panels.",
};

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <>
      <PageHero eyebrow="Word on the street" title="Reviews">
        {reviews.length > 0 ? (
          <span className="inline-flex items-center gap-2">
            <Star className="size-5 fill-ink text-ink" />
            <strong className="text-ink">{avg.toFixed(1)}</strong> average from {reviews.length} review{reviews.length > 1 ? "s" : ""}
          </span>
        ) : (
          "Got your Wronge? Tell everyone how it wears. Every review is read by a real person before it goes up."
        )}
      </PageHero>
      <Container className="grid grid-cols-1 gap-12 py-12 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {reviews.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-line p-10 text-center">
              <p className="display-narrow text-3xl">No reviews yet</p>
              <p className="mt-2 text-muted">Be the first. Your review helps someone pick their size and their art.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-3xl border border-line p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={i < r.rating ? "size-4 fill-ink text-ink" : "size-4 text-line"} />
                      ))}
                    </div>
                    <span className="tabular-nums text-xs text-muted">{formatDate(r.created_at)}</span>
                  </div>
                  {r.title && <p className="mt-3 font-bold uppercase">{r.title}</p>}
                  <p className="mt-2 text-muted">{r.body}</p>
                  <p className="mt-4 tabular-nums text-xs uppercase">
                    {r.name}
                    {r.location && <span className="text-muted"> · {r.location}</span>}
                    {r.panel_name && <span className="text-muted"> · Wears {r.panel_name}</span>}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <aside className="lg:col-span-5">
          <div className="rounded-[21px] border border-line bg-card p-6 lg:sticky lg:top-28">
            <h2 className="display-narrow mb-5 text-3xl">Write a review</h2>
            <ReviewForm />
          </div>
        </aside>
      </Container>
    </>
  );
}
