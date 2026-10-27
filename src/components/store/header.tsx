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
import { buttonClass } from "@/components/ui/button";
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
    <header className={cn("sticky top-0 z-50 border-b border-line bg-card transition-shadow duration-300", scrolled && "shadow-[0_1px_12px_rgb(0_0_0/0.06)]")}>
      <div className="relative flex h-16 items-center gap-3 px-4 sm:px-5 lg:px-6">
        <button
          type="button"
          className="-ml-2 grid size-10 place-items-center rounded-full hover:bg-ink/5 lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-6" />
        </button>

        <Logo />

        <nav className="hidden flex-1 items-center justify-center lg:flex xl:absolute xl:left-1/2 xl:-translate-x-1/2" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-2.5 font-display text-[0.95rem] font-black uppercase leading-none tracking-[-0.02em] transition hover:bg-ink/5 xl:px-4 xl:text-[1.06rem]",
                isActive(l.href) && "underline decoration-primary decoration-[3px] underline-offset-[6px]",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5">
          <Link href="/panels" aria-label="Search art panels" className="hidden size-11 place-items-center rounded-full hover:bg-ink/5 sm:grid">
            <Search className="size-6" strokeWidth={2.6} />
          </Link>
          <Link href="/panels?saved=1" aria-label="Saved panels" className="relative grid size-11 place-items-center rounded-full hover:bg-ink/5">
            <Heart className="size-6" strokeWidth={2.6} />
            {mounted && wishCount > 0 && (
              <span className="absolute right-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[0.66rem] font-bold leading-[18px] text-ink">
                {wishCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Open bag${mounted && count ? `, ${count} items` : ""}`}
            className="relative grid size-11 place-items-center rounded-full hover:bg-ink/5"
          >
            <ShoppingBag className="size-6" strokeWidth={2.6} />
            {mounted && count > 0 && (
              <span className="absolute right-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[0.66rem] font-bold leading-[18px] text-ink">
                {count}
              </span>
            )}
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
              className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col bg-card text-ink lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              aria-label="Menu"
            >
              <div className="flex h-16 items-center justify-between border-b border-line px-5">
                <Logo />
                <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="grid size-10 place-items-center rounded-full hover:bg-ink/5">
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-6" aria-label="Mobile">
                {NAV_LINKS.map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
                    <Link
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn("display block py-3 text-[1.9rem]", isActive(l.href) ? "text-ink underline decoration-primary decoration-[6px] underline-offset-[6px]" : "text-ink")}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-6 grid gap-3.5 border-t border-line pt-6 text-[1.05rem] text-ink/80">
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
                  className={buttonClass("primary", "lg", "w-full")}
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
