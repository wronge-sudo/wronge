import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";

type Variant = "primary" | "cream" | "cta" | "ink" | "outline" | "outline-light" | "ghost" | "white";
type Size = "sm" | "md" | "lg" | "xl";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-display font-black uppercase leading-none tracking-[-0.02em] transition-[transform,box-shadow,background-color,color] duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) select-none whitespace-nowrap";

// Filled variants sit on a 4px ink "press" shadow that collapses on hover/press.
const press = "shadow-press hover:translate-y-0.5 hover:shadow-[0_2px_0_0_var(--color-ink)] active:translate-y-1 active:shadow-none";

const variants: Record<Variant, string> = {
  primary: `border-[3px] border-ink bg-primary text-ink hover:bg-primary-hover ${press}`,
  // Pale "not ready yet" step CTA (e.g. "Choose a size"): still clickable, it points at what's missing.
  cream: `border-[3px] border-ink bg-cream text-ink hover:bg-primary/30 ${press}`,
  // Big flat call-to-action (set card, FAQ): thinner border, no press shadow.
  cta: "border-2 border-ink bg-primary text-ink hover:bg-primary-hover active:translate-y-px",
  ink: "border-[3px] border-ink bg-ink text-paper hover:bg-ink-3",
  outline: `border-[3px] border-ink bg-card text-ink ${press}`,
  "outline-light": "border-[3px] border-paper text-paper hover:bg-paper hover:text-ink",
  ghost: "border-[3px] border-transparent text-ink hover:bg-ink/5",
  white: `border-[3px] border-ink bg-paper text-ink ${press}`,
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.82rem]",
  md: "h-11 px-6 text-[0.98rem]",
  lg: "h-[52px] px-7 text-[1.12rem]",
  xl: "h-[52px] px-6 text-[1.45rem] sm:text-[1.875rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function LinkButton({ variant = "primary", size = "md", className, ...props }: LinkButtonProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Arrow({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("transition-transform duration-200 group-hover:translate-x-1", className)}>
      →
    </span>
  );
}
