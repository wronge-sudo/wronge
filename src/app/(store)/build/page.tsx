import type { Metadata } from "next";
import { Suspense } from "react";
import { getPanels } from "@/lib/data";
import { packagePanels } from "@/config/package";
import { Container } from "@/components/ui/section";
import { SetBuilder, SetBuilderFromParams } from "@/components/store/set-builder";

export const metadata: Metadata = {
  title: "Build Your Set",
  description: "The Wronge 4-in-1 package: the denim jacket, a blank denim panel and 2 zip-in art panels. Preview every look on the jacket before you buy.",
};

export default async function BuildPage() {
  const panels = packagePanels(await getPanels());
  return (
    <Container className="pb-16 pt-4 sm:pt-6">
      <Suspense fallback={<SetBuilder panels={panels} />}>
        <SetBuilderFromParams panels={panels} />
      </Suspense>
    </Container>
  );
}
