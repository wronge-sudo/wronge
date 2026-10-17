import type { Metadata } from "next";
import { Suspense } from "react";
import { getPanels, getSettings } from "@/lib/data";
import { taka } from "@/lib/format";
import { Container } from "@/components/ui/section";
import { PanelBrowser, PanelBrowserFromParams } from "@/components/store/panel-browser";

export const metadata: Metadata = {
  title: "Art Panels",
  description: "Original zip-in art panels for the Wronge denim jacket. Pick any 3 and change your look in under a minute.",
};

export default async function PanelsPage() {
  const [panels, settings] = await Promise.all([getPanels(), getSettings()]);

  return (
    <>
      <section className="border-b border-line">
        <Container className="grid gap-6 py-12 sm:py-16 lg:grid-cols-12 lg:items-end lg:py-20">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-4 text-muted">The swaps</p>
            <h1 className="display text-6xl sm:text-8xl lg:text-9xl">Art panels</h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-muted sm:text-lg">
              Every design zips into every Wronge jacket.{" "}
              <strong className="text-ink">
                Pick any {settings.pack_size} for {taka(settings.pack_price)}
              </strong>
              . Tap <em>Try on</em> to see it on the jacket first.
            </p>
          </div>
        </Container>
      </section>
      <Container>
        <Suspense fallback={<PanelBrowser panels={panels} />}>
          <PanelBrowserFromParams panels={panels} />
        </Suspense>
      </Container>
    </>
  );
}
