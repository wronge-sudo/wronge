import type { Metadata } from "next";
import { Suspense } from "react";
import { getPanels } from "@/lib/data";
import { Container } from "@/components/ui/section";
import { SetBuilder, SetBuilderFromParams } from "@/components/store/set-builder";

export const metadata: Metadata = {
  title: "Build Your Set",
  description: "Build your Wronge set: the denim jacket plus any 3 zip-in art panels. Preview every look on the jacket before you buy.",
};

export default async function BuildPage() {
  const panels = await getPanels();
  return (
    <Container className="pb-16 pt-4 sm:pt-6">
      <Suspense fallback={<SetBuilder panels={panels} />}>
        <SetBuilderFromParams panels={panels} />
      </Suspense>
    </Container>
  );
}
