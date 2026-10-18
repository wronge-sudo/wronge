import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";

type Variant = "primary" | "ink" | "outline" | "outline-light" | "ghost" | "white";
type Size = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.06em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light active:scale-[0.98] select-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-paper hover:bg-primary-hover shadow-[0_2px_0_0_rgb(11_11_11)] hover:shadow-none",
  ink: "bg-ink text-paper hover:bg-primary",
  outline: "border-2 border-ink text-ink hover:bg-ink hover:text-paper",
  "outline-light": "border-2 border-paper/80 text-paper hover:bg-paper hover:text-ink",
  ghost: "text-ink hover:bg-ink/5",
  white: "bg-paper text-ink hover:bg-ink hover:text-paper",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.7rem]",
  md: "h-11 px-6 text-xs",
  lg: "h-14 px-8 text-sm",
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
