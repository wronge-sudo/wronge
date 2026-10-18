import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="halftone-dark flex min-h-dvh items-center justify-center px-4 text-paper">
      <div className="text-center">
        <p className="eyebrow text-primary-light">Error 404</p>
        <h1 className="display mt-4 text-6xl sm:text-8xl">
          You went
          <br />
          wronge.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-paper/70">That page doesn&apos;t exist. Maybe it got swapped out.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonClass("primary", "lg")}>Back home</Link>
          <Link href="/panels" className={buttonClass("outline-light", "lg")}>Browse panels</Link>
        </div>
      </div>
    </main>
  );
}
