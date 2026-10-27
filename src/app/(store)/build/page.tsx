import type { Metadata } from "next";
import { Suspense } from "react";
import { getPanels, getSettings } from "@/lib/data";
import { taka } from "@/lib/format";
import { Container } from "@/components/ui/section";
import { SetBuilder, SetBuilderFromParams } from "@/components/store/set-builder";

export const metadata: Metadata = {
  title: "Build Your Set",
  description: "Build your Wronge set: the denim jacket plus any 3 zip-in art panels. Preview every look on the jacket before you buy.",
};

export default async function BuildPage() {
  const [panels, settings] = await Promise.all([getPanels(), getSettings()]);
  return (
    <>
      <section className="border-b border-line">
        <Container className="py-10 sm:py-14">
          <p className="eyebrow mb-3 text-muted">
            Jacket + any {settings.pack_size} panels · {taka(settings.jacket_price + settings.pack_price - settings.bundle_discount)}
          </p>
          <h1 className="display text-[2.5rem] sm:text-[3.5rem]">Build your set</h1>
        </Container>
      </section>
      <Container className="py-10">
        <Suspense fallback={<SetBuilder panels={panels} />}>
          <SetBuilderFromParams panels={panels} />
        </Suspense>
      </Container>
    </>
  );
}
