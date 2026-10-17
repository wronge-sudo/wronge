import type { ReactNode } from "react";
import { Container, PageHero } from "./section";

/** Simple long-form page layout used by the policy pages. */
export function ProsePage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated?: string; children: ReactNode }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title}>
        {updated && <span className="font-mono text-xs uppercase tracking-wider">Last updated {updated}</span>}
      </PageHero>
      <Container className="py-12 sm:py-16">
        <div className="max-w-3xl space-y-8 text-[1.02rem] leading-relaxed text-muted [&_h2]:display-narrow [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_strong]:text-ink [&_ul]:space-y-1.5">
          {children}
        </div>
      </Container>
    </>
  );
}
