import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { ASSETS, asset } from "@/config/assets";
import { requireAdmin } from "@/lib/admin-auth";
import { getSidebarCounts } from "@/lib/admin-data";
import { signOutAdmin } from "@/actions/admin";
import { NavLinks, NavList } from "@/components/admin/nav";

// The whole admin reads the login session on every request.
export const instant = false;

async function SidebarNav() {
  const counts = await getSidebarCounts();
  return <NavLinks counts={counts} />;
}

async function Gate({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <>
      <header className="no-print sticky top-0 z-30 flex items-center justify-end gap-2 border-b border-line/70 bg-[#f6f6f3]/90 px-4 py-2.5 backdrop-blur sm:px-6 lg:px-8">
        <span className="mr-auto hidden truncate font-mono text-xs text-muted sm:block">{user.email}</span>
        <Link href="/" target="_blank" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-xs font-semibold hover:border-ink">
          View store <ExternalLink className="size-3.5" />
        </Link>
        <form action={signOutAdmin}>
          <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-muted hover:bg-ink/5 hover:text-ink">
            <LogOut className="size-3.5" /> Sign out
          </button>
        </form>
      </header>
      <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-4 px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-line/60" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-line/40" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-line/40" />
    </div>
  );
}

export default function DashLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[244px_minmax(0,1fr)]">
      <aside className="no-print sticky top-0 z-40 bg-ink text-paper lg:h-dvh lg:overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 lg:py-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image src={asset(ASSETS.wordmarkWhite)} alt="Wronge" width={980} height={210} className="h-5 w-auto" loading="eager" />
            <span className="rounded bg-primary px-1.5 py-0.5 font-mono text-[0.6rem] font-bold text-paper">ADMIN</span>
          </Link>
        </div>
        <Suspense fallback={<NavList pathname={null} counts={null} />}>
          <SidebarNav />
        </Suspense>
        <p className="mt-8 hidden px-6 pb-6 text-xs leading-relaxed text-paper/40 lg:block">
          New order? Call the customer, then press <strong className="text-paper/70">Confirm</strong> on the order page.
        </p>
      </aside>
      <div className="min-w-0">
        <Suspense fallback={<PageSkeleton />}>
          <Gate>{children}</Gate>
        </Suspense>
      </div>
    </div>
  );
}
