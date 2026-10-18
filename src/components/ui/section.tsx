import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = "left",
  light = false,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(align === "center" && "mx-auto max-w-3xl text-center", className)}>
      {eyebrow && (
        <p className={cn("eyebrow mb-4 inline-flex items-center gap-2", light ? "text-primary-light" : "text-muted")}>
          <span className={cn("inline-block size-1.5 rotate-45", light ? "bg-primary-light" : "bg-ink")} aria-hidden />
          {eyebrow}
        </p>
      )}
      <h2 className={cn("display text-[2.4rem] sm:text-6xl lg:text-7xl", light && "text-paper")}>{title}</h2>
      {children && (
        <div className={cn("mt-5 max-w-xl text-base sm:text-lg", align === "center" && "mx-auto", light ? "text-paper/70" : "text-muted")}>
          {children}
        </div>
      )}
    </div>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="border-b border-line">
      <Container className="py-12 sm:py-16 lg:py-20">
        {eyebrow && <p className="eyebrow mb-4 text-muted">{eyebrow}</p>}
        <h1 className="display text-5xl sm:text-7xl lg:text-8xl">{title}</h1>
        {children && <div className="mt-5 max-w-2xl text-base text-muted sm:text-lg">{children}</div>}
      </Container>
    </section>
  );
}
