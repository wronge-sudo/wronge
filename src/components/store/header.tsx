"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { NAV_LINKS } from "@/config/site";
import { cartCount } from "@/lib/pricing";
import { cn } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/lib/use-mounted";
import { Logo } from "./logo";

/** Reads the pathname (needs a Suspense boundary for routes with unknown params). */
export function HeaderWithPath() {
  const pathname = usePathname();
  return <Header pathname={pathname} />;
}

export function Header({ pathname }: { pathname: string | null }) {
  const mounted = useMounted();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = useCart((s) => cartCount(s.lines));
  const setCartOpen = useCart((s) => s.setOpen);
  const wishCount = useWishlist((s) => s.slugs.length);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => !!pathname && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled ? "border-line bg-paper/90 backdrop-blur-md" : "border-transparent bg-paper",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-10">
        <button
          type="button"
          className="-ml-2 grid size-10 place-items-center rounded-full hover:bg-ink/5 lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <Logo />

        <nav className="ml-8 hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "relative rounded-full px-3.5 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] transition hover:bg-ink/5",
                isActive(l.href) && "bg-ink text-paper hover:bg-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link href="/panels" aria-label="Search art panels" className="hidden size-10 place-items-center rounded-full hover:bg-ink/5 sm:grid">
            <Search className="size-[18px]" />
          </Link>
          <Link href="/panels?saved=1" aria-label="Saved panels" className="relative grid size-10 place-items-center rounded-full hover:bg-ink/5">
            <Heart className="size-[18px]" />
            {mounted && wishCount > 0 && (
              <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-signal px-1 font-mono text-[0.6rem] font-bold leading-4 text-white">
                {wishCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Open bag${mounted && count ? `, ${count} items` : ""}`}
            className="relative flex h-10 items-center gap-2 rounded-full bg-ink pl-3.5 pr-4 text-paper transition hover:bg-acid hover:text-ink"
          >
            <ShoppingBag className="size-[18px]" />
            <span className="font-mono text-xs font-bold">{mounted ? count : 0}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-ink/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col bg-ink text-paper lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              aria-label="Menu"
            >
              <div className="flex h-16 items-center justify-between px-5">
                <Logo light />
                <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="grid size-10 place-items-center rounded-full hover:bg-paper/10">
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-6" aria-label="Mobile">
                {NAV_LINKS.map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
                    <Link
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn("display block py-3 text-3xl", isActive(l.href) ? "text-acid" : "text-paper")}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-6 grid gap-3 border-t border-paper/15 pt-6 text-sm text-paper/70">
                  <Link href="/track" onClick={() => setMenuOpen(false)}>Track your order</Link>
                  <Link href="/faq" onClick={() => setMenuOpen(false)}>FAQ</Link>
                  <Link href="/reviews" onClick={() => setMenuOpen(false)}>Reviews</Link>
                  <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
                </div>
              </nav>
              <div className="p-5">
                <Link
                  href="/build"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-14 items-center justify-center rounded-full bg-acid text-sm font-bold uppercase tracking-wider text-ink"
                >
                  Build your set →
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
