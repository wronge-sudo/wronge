import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPanel, getPanels } from "@/lib/data";
import { Container } from "@/components/ui/section";
import { PanelCard } from "@/components/store/panel-card";
import { PanelActions, PanelGallery } from "@/components/store/panel-actions";

export async function generateStaticParams() {
  const panels = await getPanels();
  return panels.length ? panels.map((p) => ({ slug: p.slug })) : [{ slug: "have-we-been-cursed" }];
}

export async function generateMetadata(props: PageProps<"/panels/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const panel = await getPanel(slug);
  if (!panel) return { title: "Panel not found" };
  return {
    title: `${panel.name} — Art Panel`,
    description: panel.description ?? `${panel.name}: a zip-in art panel for the Wronge denim jacket.`,
    openGraph: { images: [{ url: panel.image_url }] },
  };
}

export default function PanelPage(props: PageProps<"/panels/[slug]">) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <PanelDetail params={props.params} />
    </Suspense>
  );
}

async function PanelDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [panel, panels] = await Promise.all([getPanel(slug), getPanels()]);
  if (!panel) notFound();

  const related = [
    ...panels.filter((p) => p.category === panel.category && p.slug !== panel.slug),
    ...panels.filter((p) => p.category !== panel.category),
  ].slice(0, 4);

  return (
    <>
      <Container className="py-6">
        <nav className="font-mono text-xs uppercase tracking-wider text-muted" aria-label="Breadcrumb">
          <Link href="/panels" className="hover:text-ink">Art panels</Link> <span aria-hidden>/</span>{" "}
          <Link href={`/panels?category=${encodeURIComponent(panel.category)}`} className="hover:text-ink">{panel.category}</Link>{" "}
          <span aria-hidden>/</span> <span className="text-ink">{panel.name}</span>
        </nav>
      </Container>

      <Container className="grid gap-10 pb-20 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <PanelGallery panel={panel} />
        </div>
        <div className="lg:col-span-5 lg:pt-6">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow text-muted">{panel.category}{panel.badge && <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-primary-light">{panel.badge}</span>}</p>
            <h1 className="display mt-3 text-5xl sm:text-6xl">{panel.name}</h1>
            <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted">Art by {panel.artist}</p>
            {panel.description && <p className="mt-6 text-lg text-muted">{panel.description}</p>}

            <div className="mt-8">
              <PanelActions panel={panel} />
            </div>

            <dl className="mt-10 divide-y divide-line border-y border-line text-sm">
              {[
                ["Fabric", "Thick, smooth woven canvas that stays flat and taut. No sagging, no creasing."],
                ["Print", "High-definition, fade-resistant print framed by a narrow black border."],
                ["Fit", "Standard Wronge panel size. Zips into every Wronge jacket via the 3-sided zip frame."],
                ["Care", "Spot-clean, or hand-wash gently in cold water and dry flat. Don't iron directly on the print."],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-4 py-3.5">
                  <dt className="font-mono text-xs font-bold uppercase tracking-wider">{k}</dt>
                  <dd className="col-span-2 text-muted">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-muted">
              Panels zip into the Wronge jacket.{" "}
              <Link href="/jacket" className="font-semibold text-ink underline underline-offset-4">Don&apos;t have one yet?</Link>
            </p>
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section className="border-t border-line py-16 sm:py-20">
          <Container>
            <h2 className="display text-4xl sm:text-5xl">Pairs well with</h2>
            <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-4">
              {related.map((p) => (
                <PanelCard key={p.slug} panel={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

function PanelSkeleton() {
  return (
    <Container className="grid gap-10 py-14 lg:grid-cols-12 lg:gap-16">
      <div className="aspect-square animate-pulse rounded-3xl bg-paper-2 lg:col-span-7" />
      <div className="space-y-4 lg:col-span-5">
        <div className="h-4 w-24 animate-pulse rounded bg-paper-2" />
        <div className="h-14 w-3/4 animate-pulse rounded bg-paper-2" />
        <div className="h-24 animate-pulse rounded bg-paper-2" />
        <div className="h-14 w-48 animate-pulse rounded-full bg-paper-2" />
      </div>
    </Container>
  );
}
