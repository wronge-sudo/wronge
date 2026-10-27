"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Inbox, LayoutDashboard, Package, Palette, Settings, Star } from "lucide-react";
import { cn } from "@/lib/format";

export type NavCounts = { orders: number; messages: number; reviews: number } | null;

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Package, count: "orders" as const },
  { href: "/admin/panels", label: "Panels", icon: Palette },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/reviews", label: "Reviews", icon: Star, count: "reviews" as const },
  { href: "/admin/messages", label: "Messages", icon: Inbox, count: "messages" as const },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

/** Static list (no active state) — used as the Suspense fallback. */
export function NavList({ pathname, counts }: { pathname: string | null; counts: NavCounts }) {
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0" aria-label="Admin">
      {LINKS.map((l) => {
        const active = pathname !== null && (l.exact ? pathname === l.href : pathname.startsWith(l.href));
        const n = l.count && counts ? counts[l.count] : 0;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
              active ? "bg-primary text-ink" : "text-paper/70 hover:bg-white/10 hover:text-paper",
            )}
          >
            <l.icon className="size-4" />
            {l.label}
            {n > 0 && (
              <span className={cn("ml-auto rounded-full px-2 py-0.5 font-mono text-[0.65rem] font-bold", active ? "bg-paper text-ink" : "bg-signal text-white")}>
                {n > 99 ? "99+" : n}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function NavLinks({ counts }: { counts: NavCounts }) {
  const pathname = usePathname();
  return <NavList pathname={pathname} counts={counts} />;
}
