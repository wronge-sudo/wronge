import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn, STATUS_LABEL } from "@/lib/format";

export const adminInput =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm outline-none transition placeholder:text-muted/60 focus:border-ink focus:ring-2 focus:ring-ink/10";

export const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900 ring-amber-300",
  confirmed: "bg-sky-100 text-sky-900 ring-sky-300",
  processing: "bg-violet-100 text-violet-900 ring-violet-300",
  shipped: "bg-indigo-100 text-indigo-900 ring-indigo-300",
  delivered: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  cancelled: "bg-zinc-200 text-zinc-700 ring-zinc-300",
  returned: "bg-rose-100 text-rose-900 ring-rose-300",
};

export const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-sky-500",
  processing: "bg-violet-500",
  shipped: "bg-indigo-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-zinc-400",
  returned: "bg-rose-500",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide ring-1 ring-inset", STATUS_TONE[status], className)}>
      <span className={cn("size-1.5 rounded-full", STATUS_DOT[status])} />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function Card({ title, action, children, className, padded = true }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <section className={cn("rounded-2xl border border-line/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]", className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-line/70 px-5 py-3.5">
          {title && <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>}
          {action}
        </header>
      )}
      <div className={padded ? "p-5" : undefined}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display-narrow text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Delta({ value }: { value: number | null }) {
  if (value === null || !Number.isFinite(value)) return <span className="text-xs text-muted">no previous data</span>;
  const up = value >= 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold", up ? "text-emerald-700" : "text-rose-700")}>
      {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
      {Math.abs(value * 100).toFixed(0)}% <span className="font-normal text-muted">vs previous</span>
    </span>
  );
}

export function StatCard({ label, value, sub, icon, accent }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-5", accent ? "border-ink bg-ink text-paper" : "border-line/80 bg-white")}>
      <div className="flex items-center justify-between">
        <p className={cn("text-xs font-bold uppercase tracking-wider", accent ? "text-paper/60" : "text-muted")}>{label}</p>
        {icon && <span className={accent ? "text-acid" : "text-muted"}>{icon}</span>}
      </div>
      <p className="mt-2 font-mono text-2xl font-bold tracking-tight sm:text-[1.7rem]">{value}</p>
      {sub && <div className="mt-1.5">{sub}</div>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-line px-6 py-12 text-center">
      <p className="font-bold uppercase tracking-tight">{title}</p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}

/** Horizontal bar list, e.g. top districts. */
export function BarList({ rows, format = (n) => String(n), empty = "No data yet" }: { rows: { label: ReactNode; value: number; href?: string }[]; format?: (n: number) => string; empty?: string }) {
  if (!rows.length) return <p className="text-sm text-muted">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => {
        const inner = (
          <>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span className="truncate">{r.label}</span>
              <span className="font-mono font-semibold">{format(r.value)}</span>
            </div>
            <div className="h-2 rounded-full bg-paper-2">
              <div className="h-2 rounded-full bg-ink" style={{ width: `${Math.max(3, (r.value / max) * 100)}%` }} />
            </div>
          </>
        );
        return <li key={i}>{r.href ? <Link href={r.href} className="block hover:opacity-80">{inner}</Link> : inner}</li>;
      })}
    </ul>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "ok"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl px-4 py-3 text-sm",
        tone === "warn" && "bg-amber-100 text-amber-950",
        tone === "info" && "bg-sky-50 text-sky-950",
        tone === "ok" && "bg-emerald-50 text-emerald-950",
      )}
    >
      {children}
    </div>
  );
}
