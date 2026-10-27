import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1185px] px-4 sm:px-6 lg:px-[23px]", className)}>{children}</div>;
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
      {eyebrow && <p className={cn("eyebrow mb-3", light ? "text-primary-light" : "text-ink")}>{eyebrow}</p>}
      <h2 className={cn("display text-[2rem] sm:text-[2.4rem]", light && "text-paper")}>{title}</h2>
      {children && (
        <div className={cn("mt-3 max-w-xl text-[1.05rem] sm:text-lg", align === "center" && "mx-auto", light ? "text-paper/75" : "text-ink/80")}>
          {children}
        </div>
      )}
    </div>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="border-b border-line bg-card">
      <Container className="py-10 sm:py-14">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="display text-[2.5rem] sm:text-[3.5rem]">{title}</h1>
        {children && <div className="mt-4 max-w-2xl text-[1.05rem] text-ink/80 sm:text-lg">{children}</div>}
      </Container>
    </section>
  );
}
