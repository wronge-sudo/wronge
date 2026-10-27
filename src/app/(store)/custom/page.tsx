import type { Metadata } from "next";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { Container } from "@/components/ui/section";
import { CustomStudio } from "@/components/store/custom-studio";

export const metadata: Metadata = {
  title: "Create Your Own Panel",
  description: "Upload your own art, photo or logo and turn it into a zip-in back panel for your Wronge jacket.",
};

export default function CustomPage() {
  return (
    <>
      <section className="border-b border-line bg-ink text-paper">
        <Container className="py-12 sm:py-16">
          <p className="eyebrow mb-3 text-primary-light">Custom panel studio</p>
          <h1 className="display text-[2.5rem] sm:text-[3.5rem]">
            Your art.
            <br />
            Your back.
          </h1>
          <p className="mt-5 max-w-xl text-paper/70 sm:text-lg">
            Upload a drawing, a photo, your band&apos;s logo or anything you love. Position it on the panel, see it on the jacket, and add it to your pack.
          </p>
        </Container>
      </section>
      <Container className="py-10 sm:py-14">
        <CustomStudio uploadsEnabled={isCloudinaryConfigured()} />
      </Container>
    </>
  );
}
