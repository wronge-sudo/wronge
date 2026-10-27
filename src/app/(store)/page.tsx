import Image from "next/image";
import Link from "next/link";
import { Layers, Palette, RefreshCcw, Star, Upload } from "lucide-react";
import { getApprovedReviews, getPanels, getSettings } from "@/lib/data";
import type { Panel, Review } from "@/lib/types";
import { ASSETS, BACK_PANEL_RECT, asset } from "@/config/assets";
import { getFaqs } from "@/config/faq";
import { taka } from "@/lib/format";
import { Container } from "@/components/ui/section";
import { Arrow, LinkButton } from "@/components/ui/button";
import { FaqList } from "@/components/ui/faq-list";
import { SetConfigurator } from "@/components/home/set-configurator";
import { LookCarousel } from "@/components/home/look-carousel";
import { VibeCarousel, type VibeGroup } from "@/components/home/vibe-carousel";
import { ReviewWall, type WallItem } from "@/components/home/review-wall";
import { SwapStudio } from "@/components/store/swap-studio";
import { JacketBack } from "@/components/store/jacket-back";
import { SWAP_STEPS, SwapDiagram } from "@/components/store/swap-diagram";

const featuredFirst = (a: Panel, b: Panel) => Number(b.is_featured) - Number(a.is_featured);

function groupBy(panels: Panel[], key: "category" | "artist", href: (name: string) => string): VibeGroup[] {
  return Array.from(new Set(panels.map((p) => p[key]))).map((name) => {
    const list = panels.filter((p) => p[key] === name).sort(featuredFirst);
    return { name, count: list.length, images: list.slice(0, 3).map((p) => p.image_url), badge: list.find((p) => p.badge)?.badge ?? null, href: href(name) };
  });
}

/** Two marquee rows of review bubbles, each next to a jacket wearing the panel it mentions. */
function wallRows(reviews: Review[], pool: Panel[]): [WallItem[], WallItem[]] {
  const byName = new Map(pool.map((p) => [p.name.toLowerCase(), p]));
  let n = 0;
  const photo = (hint: string | null): WallItem[] => {
    if (!pool.length) return [];
    const p = (hint && byName.get(hint.toLowerCase())) || pool[n % pool.length];
    return [{ kind: "photo", key: `p${n++}`, image: p.image_url, name: p.name }];
  };
  const quote = (r: Review): WallItem => ({ kind: "review", key: `r${n++}`, body: r.body, name: r.name, panel: r.panel_name });

  const halves = [reviews.filter((_, i) => i % 2 === 0), reviews.filter((_, i) => i % 2 === 1)];
  if (!halves[1].length) halves[1] = halves[0];
  return halves.map((list, row) => {
    const items: WallItem[] = [];
    // Repeat short lists so one copy of a row is wider than a big screen (the wall shows two copies).
    while (items.length < 9) {
      list.forEach((r, k) => {
        items.push(...(row === 0 ? [...photo(r.panel_name), quote(r)] : [quote(r), ...photo(r.panel_name)]));
        if (k % 2) items.push(...photo(null));
      });
    }
    return items;
  }) as [WallItem[], WallItem[]];
}

export default async function HomePage() {
  const [panels, settings, reviews] = await Promise.all([getPanels(), getSettings(), getApprovedReviews()]);
  const showcase = [...panels].sort(featuredFirst);
  const art = showcase.slice(0, settings.pack_size).map((p) => ({ slug: p.slug, name: p.name, image: p.image_url }));
  const looks = showcase.slice(0, 7).map((p) => ({ slug: p.slug, name: p.name, image: p.image_url, badge: p.badge }));
  const categories = groupBy(panels, "category", (c) => `/panels?category=${encodeURIComponent(c)}`);
  const artists = groupBy(panels, "artist", (a) => `/panels?q=${encodeURIComponent(a)}`);
  const faqs = getFaqs(settings).slice(0, 8);

  return (
    <>
      {/* ───────────── HERO ───────────── */}
      <section className="on-dark relative h-[560px] overflow-hidden bg-ink sm:h-[620px]">
        <Image
          src={asset(ASSETS.hero)}
          alt="Two people wearing Wronge washed-black denim jackets, one showing an art panel zipped into the back"
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[64%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent sm:bg-gradient-to-r sm:from-ink/55 sm:via-ink/15 sm:to-transparent" />
        <Container className="relative flex h-full items-end pb-10 sm:items-center sm:pb-0">
          <div className="grid max-w-xl gap-4">
            <h1 className="display text-[1.85rem] text-cream sm:text-[2rem]">One jacket. Endless backs.</h1>
            <p className="text-[1.05rem] leading-[1.55] text-cream sm:text-[1.2rem]">Washed-black denim with a zip-out back panel. New art in under a minute.</p>
            <div className="pt-2">
              <LinkButton href="/build" size="lg">
                Build your set
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────────── BENEFIT PILLS ───────────── */}
      <section className="bg-paper py-8" aria-label="Why it works">
        <Container>
          <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {[
              { Icon: RefreshCcw, t: "Zip-out back panel", href: "/how-it-works" },
              { Icon: Layers, t: "Every panel fits every jacket", href: "/panels" },
              { Icon: Palette, t: "Original art", href: "/panels" },
              { Icon: Upload, t: "Upload your own design", href: "/custom" },
            ].map(({ Icon, t, href }) => (
              <li key={t}>
                <Link
                  href={href}
                  className="flex h-[50px] items-center justify-center gap-2 rounded-full border border-ink/30 px-2.5 text-center text-[0.8rem] font-semibold leading-tight transition-colors hover:border-ink hover:bg-card"
                >
                  <Icon className="size-5 shrink-0" strokeWidth={2.2} aria-hidden />
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ───────────── THE SET ───────────── */}
      <section className="bg-sand px-3 py-10 sm:px-5 sm:py-14">
        <SetConfigurator art={art} />
      </section>

      {/* ───────────── HOW IT SWAPS ───────────── */}
      <section className="bg-paper py-12 sm:py-14">
        <Container>
          <h2 className="sr-only">How it swaps</h2>
          <ol className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-6">
            {SWAP_STEPS.map((s, i) => (
              <li key={s.title} className="grid content-start gap-3 sm:gap-[17px]">
                <div className="w-[130px] max-w-full sm:w-[170px]">
                  <SwapDiagram step={(i + 1) as 1 | 2 | 3 | 4} />
                </div>
                <div>
                  <h3 className="display-narrow text-[1.05rem] sm:text-[1.2rem]">{s.title}</h3>
                  <p className="mt-1.5 max-w-[270px] text-[0.93rem] leading-[1.5] sm:text-[1.13rem] sm:leading-[1.55]">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ───────────── LOOKS CAROUSEL ───────────── */}
      {looks.length > 0 && (
        <section className="overflow-hidden bg-cream py-10">
          <Container>
            <LookCarousel looks={looks} />
          </Container>
        </section>
      )}

      {/* ───────────── SHOP BY VIBE ───────────── */}
      {categories.length > 0 && (
        <section className="overflow-hidden bg-paper py-10">
          <Container>
            <VibeCarousel categories={categories} artists={artists} />
          </Container>
        </section>
      )}

      {/* ───────────── SWAP STUDIO ───────────── */}
      <section className="halftone-dark py-14 text-paper sm:py-16" id="studio">
        <Container>
          <p className="eyebrow mb-3 text-primary-light">Swap studio</p>
          <h2 className="display text-[2rem] sm:text-[2.4rem]">Try it on. Right here.</h2>
          <p className="mt-3 max-w-xl text-[1.05rem] text-paper/75 sm:text-[1.2rem]">
            Tap any design to zip it into the back of the jacket. Find your favourites, add them to your pack.
          </p>
          <div className="mt-10">
            <SwapStudio panels={panels} />
          </div>
        </Container>
      </section>

      {/* ───────────── YOUR ART ───────────── */}
      <section className="bg-cream py-12 sm:py-14">
        <Container>
          <div className="text-center">
            <p className="eyebrow">Create your own</p>
            <h2 className="display mt-3 text-[2rem] sm:text-[2.4rem]">
              Your art.
              <br />
              Your back.
            </h2>
          </div>
          <div className="mt-8 grid gap-[17px] lg:grid-cols-2">
            <Link href="/custom" className="group relative overflow-hidden rounded-[16px] bg-studio shadow-[0_3px_10px_rgb(0_0_0/0.07)] lg:row-span-2">
              <JacketBack panel={null} rounded={false} sizes="(min-width: 1024px) 560px, 92vw" />
              <div
                className="absolute grid place-items-center rounded-sm border-2 border-dashed border-primary bg-ink/60 text-center transition-colors group-hover:bg-ink/75"
                style={{ left: `${BACK_PANEL_RECT.left}%`, top: `${BACK_PANEL_RECT.top}%`, width: `${BACK_PANEL_RECT.width}%`, height: `${BACK_PANEL_RECT.height}%` }}
              >
                <span className="display-narrow px-2 text-[0.8rem] leading-tight text-primary sm:text-base">
                  Your
                  <br />
                  art
                  <br />
                  here
                </span>
              </div>
              <span className="absolute left-[17px] top-[17px] rounded-full bg-ink/80 px-3 py-1.5 text-[0.8rem] font-black uppercase tracking-tight text-paper backdrop-blur">
                Custom panel studio
              </span>
            </Link>
            {[
              {
                img: ASSETS.hero,
                box: "inset-0",
                fit: "object-cover object-[30%_center]",
                shade: "bg-gradient-to-t from-ink/90 via-ink/50 to-ink/10",
                title: <>Upload anything.<br />Wear it on your back.</>,
                body: "A drawing, a photo, your band's logo or your crew's inside joke. Upload it, position it, done.",
              },
              {
                img: ASSETS.profileDark,
                // The square W mark sits at the right and fades into the black tile.
                box: "inset-y-0 right-0 aspect-square [mask-image:linear-gradient(90deg,transparent,#000_45%)]",
                fit: "object-cover",
                shade: "bg-gradient-to-r from-ink/70 via-ink/30 to-ink/0",
                title: <>Checked by us.<br />Printed for you.</>,
                body: `It takes one slot in your pack${settings.custom_panel_fee > 0 ? ` (+${taka(settings.custom_panel_fee)})` : ""}. We check every design before we print.`,
              },
            ].map((t, i) => (
              <div key={i} className="relative flex min-h-[260px] items-end overflow-hidden rounded-[16px] bg-ink p-6 text-paper shadow-[0_3px_10px_rgb(0_0_0/0.07)] sm:p-7">
                <div className={`absolute ${t.box}`}>
                  <Image src={asset(t.img)} alt="" fill sizes="(min-width: 1024px) 560px, 92vw" className={t.fit} />
                </div>
                <div className={`absolute inset-0 ${t.shade}`} />
                <div className="relative">
                  <h3 className="display-narrow text-[1.3rem] leading-none">{t.title}</h3>
                  <p className="mt-2 max-w-md text-[1.05rem] leading-[1.55] text-paper/90 sm:text-[1.13rem]">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <LinkButton href="/custom" size="lg">
              Upload your art <Arrow />
            </LinkButton>
          </div>
        </Container>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="bg-paper py-10 sm:py-12">
        <Container className="grid gap-[34px] lg:grid-cols-[415fr_623fr] lg:gap-x-[100px]">
          <header className="grid content-start gap-[17px]">
            <h2 className="display text-[2rem] sm:text-[2.4rem]">
              Good
              <br />
              questions.
            </h2>
            <span className="h-1.5 w-[76px] bg-primary" aria-hidden />
            <p className="max-w-sm text-[1.05rem] leading-[1.55]">
              Still curious? There&apos;s more on the{" "}
              <Link href="/faq" className="font-bold underline underline-offset-4">
                FAQ page
              </Link>
              , or just message us.
            </p>
          </header>
          <div>
            <FaqList faqs={faqs} />
            <LinkButton href="/build" variant="cta" size="xl" className="mt-[34px]">
              Build your set
            </LinkButton>
          </div>
        </Container>
      </section>

      {/* ───────────── REVIEWS ───────────── */}
      {reviews.length > 0 && (
        <section className="on-dark overflow-hidden bg-ink py-[72px] text-cream">
          <header className="flex flex-col items-center px-[25.5px] text-center">
            <h2 className="display text-[2rem] sm:text-[2.4rem]">
              <Link href="/reviews" className="inline-flex items-center gap-[9.5px] hover:underline">
                <Star className="size-[34px] fill-cream sm:size-[38px]" strokeWidth={0} aria-hidden />
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </Link>
            </h2>
            <span className="mt-4 h-1.5 w-[76px] bg-primary" aria-hidden />
            <p className="mt-4 text-[1.05rem] leading-[1.55] sm:text-[1.2rem]">From people wearing Wronge around Bangladesh.</p>
          </header>
          <div className="mt-[42px]">
            <ReviewWall rows={wallRows(reviews.slice(0, 12), showcase)} />
          </div>
          <footer className="mt-[42px] grid justify-items-center gap-[17px] px-[25.5px] text-center">
            <h3 className="display text-[1.9rem] sm:text-[2.125rem]">Your back next.</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <LinkButton href="/build" size="lg">
                Build your set
              </LinkButton>
              <LinkButton href="/reviews" variant="outline-light" size="lg">
                Read all reviews
              </LinkButton>
            </div>
          </footer>
        </section>
      )}
    </>
  );
}
