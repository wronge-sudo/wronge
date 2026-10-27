"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType, type FormEvent, type SVGProps } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, Heart, Menu, Search, ShoppingBag, Truck, X } from "lucide-react";
import { NAV_LINKS } from "@/config/site";
import { cartCount } from "@/lib/pricing";
import { cn } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/lib/use-mounted";
import { Logo } from "./logo";
import { JacketIcon, PanelsIcon } from "./menu-icons";

/** Mobile menu rows: the main nav plus help links. Product rows get an icon tile. */
const MENU_LINKS = [...NAV_LINKS, { href: "/faq", label: "FAQ" }, { href: "/contact", label: "Contact" }];
const MENU_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = { "/panels": PanelsIcon, "/jacket": JacketIcon };

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute right-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[0.66rem] font-bold leading-[18px] text-ink">
      {n}
    </span>
  );
}

/** Reads the pathname (needs a Suspense boundary for routes with unknown params). */
export function HeaderWithPath() {
  const pathname = usePathname();
  return <Header pathname={pathname} />;
}

export function Header({ pathname }: { pathname: string | null }) {
  const router = useRouter();
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
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    if (menuOpen) window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isActive = (href: string) => !!pathname && (pathname === href || pathname.startsWith(`${href}/`));

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    setMenuOpen(false);
    router.push(q ? `/panels?q=${encodeURIComponent(q)}` : "/panels");
  };

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
            {mounted && wishCount > 0 && <CountBadge n={wishCount} />}
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Open bag${mounted && count ? `, ${count} items` : ""}`}
            className="relative grid size-11 place-items-center rounded-full hover:bg-ink/5"
          >
            <ShoppingBag className="size-6" strokeWidth={2.6} />
            {mounted && count > 0 && <CountBadge n={count} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-md lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            {/* Any link inside closes the menu (rows, logo, footer links). */}
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[90%] max-w-md flex-col rounded-r-[21px] bg-paper text-ink shadow-xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              onClick={(e) => (e.target as HTMLElement).closest("a") && setMenuOpen(false)}
              aria-label="Menu"
            >
              <div className="flex h-[70px] shrink-0 items-center justify-between px-[21px]">
                <Logo />
                <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="grid size-11 place-items-center rounded-full hover:bg-ink/5">
                  <X className="size-9" strokeWidth={3} />
                </button>
              </div>

              <form
                role="search"
                onSubmit={onSearch}
                className="mx-[17px] mb-[17px] mt-2 flex h-[46px] shrink-0 items-center rounded-[11px] border border-ink/12 bg-card pr-1 focus-within:border-ink"
              >
                <input
                  type="search"
                  name="q"
                  placeholder="Search"
                  aria-label="Search art panels"
                  enterKeyHint="search"
                  autoComplete="off"
                  className="h-full min-w-0 flex-1 bg-transparent px-[17px] text-base outline-none placeholder:text-ink/50"
                />
                <button type="submit" aria-label="Search" className="grid size-11 shrink-0 place-items-center rounded-[7px] hover:bg-ink/5">
                  <Search className="size-6" strokeWidth={3} />
                </button>
              </form>

              <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[17px]" aria-label="Mobile">
                {MENU_LINKS.map((l) => {
                  const Icon = MENU_ICONS[l.href];
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      className={cn(
                        "flex min-h-[54px] items-center gap-[13px] border-b border-ink/8 px-[7px] py-3 text-[17px] leading-[26px] transition-colors active:bg-ink/5",
                        isActive(l.href) && "font-semibold",
                      )}
                    >
                      {Icon && (
                        <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-sand">
                          <Icon className="size-7" />
                        </span>
                      )}
                      <span className="flex-1">{l.label}</span>
                      <ChevronRight className="-mr-1.5 size-6 shrink-0" strokeWidth={3} aria-hidden />
                    </Link>
                  );
                })}
              </nav>

              <div className="flex min-h-[79px] shrink-0 items-center justify-between gap-2 px-[17px] pb-[env(safe-area-inset-bottom)]">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setCartOpen(true);
                  }}
                  className="flex min-h-11 items-center gap-2 text-[17px]"
                >
                  <ShoppingBag className="size-5" strokeWidth={2.6} aria-hidden />
                  Bag ({count})
                </button>
                <Link href="/panels?saved=1" aria-label="Saved panels" className="relative grid size-11 place-items-center rounded-full hover:bg-ink/5">
                  <Heart className="size-6" strokeWidth={2.6} />
                  {wishCount > 0 && <CountBadge n={wishCount} />}
                </Link>
                <Link href="/track" className="flex min-h-11 items-center gap-2 text-[17px]">
                  <Truck className="size-5" strokeWidth={2.6} aria-hidden />
                  Track order
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
