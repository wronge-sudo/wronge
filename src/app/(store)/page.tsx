import Image from "next/image";
import Link from "next/link";
import { Banknote, Layers, MapPin, RefreshCcw, Star } from "lucide-react";
import { getApprovedReviews, getPanels, getSettings } from "@/lib/data";
import { ASSETS, ASSET_SIZES, BACK_PANEL_RECT, asset } from "@/config/assets";
import { getFaqs } from "@/config/faq";
import { taka } from "@/lib/format";
import { Container, SectionHeading } from "@/components/ui/section";
import { Arrow, LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { FaqList } from "@/components/ui/faq-list";
import { HeroSwapCard } from "@/components/home/hero-swap-card";
import { SwapStudio } from "@/components/store/swap-studio";
import { PanelCard } from "@/components/store/panel-card";
import { JacketBack } from "@/components/store/jacket-back";
import { SWAP_STEPS, SwapDiagram } from "@/components/store/swap-diagram";

export default async function HomePage() {
  const [panels, settings, reviews] = await Promise.all([getPanels(), getSettings(), getApprovedReviews()]);
  const featured = panels.filter((p) => p.is_featured);
  const showcase = (featured.length >= 4 ? featured : panels).slice(0, 8);
  const heroPanels = (featured.length ? featured : panels).slice(0, 6).map((p) => ({ image: p.image_url, name: p.name }));
  const categories = Array.from(new Set(panels.map((p) => p.category))).map((c) => ({
    name: c,
    panels: panels.filter((p) => p.category === c),
  }));
  const faqs = getFaqs(settings).slice(0, 6);
  const setPrice = settings.jacket_price + settings.pack_price - settings.bundle_discount;

  return (
    <>
      {/* ───────────── HERO ───────────── */}
      <section className="relative overflow-hidden">
        <Container className="pt-8 sm:pt-12">
          <div className="grid items-end gap-6 lg:grid-cols-12">
            <h1 className="display text-[14vw] leading-[0.86] sm:text-[11vw] lg:col-span-9 lg:text-[6.7vw] 2xl:text-[6.9rem]">
              One jacket.
              <br />
              <span className="text-transparent [-webkit-text-stroke:2px_#0b0b0b] sm:[-webkit-text-stroke:3px_#0b0b0b]">Endless</span> backs.
            </h1>
            <div className="lg:col-span-3 lg:pb-3">
              <p className="max-w-sm text-base text-muted sm:text-lg">
                Heavyweight washed-black denim with a <strong className="text-ink">zip-out back panel</strong>. Wear it clean, or zip in
                original art and change your whole look in under a minute.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <LinkButton href="/build" size="lg">
                  Build your set <Arrow />
                </LinkButton>
                <LinkButton href="/panels" variant="outline" size="lg">
                  Shop panels
                </LinkButton>
              </div>
            </div>
          </div>
        </Container>

        <Container className="mt-8 sm:mt-10">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-studio sm:aspect-[16/10] lg:aspect-[16/8.4] lg:rounded-[2.5rem]">
            <Image
              src={asset(ASSETS.hero)}
              alt="Two people wearing Wronge washed-black denim jackets, one showing an art panel zipped into the back"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1440px) 1360px, 100vw"
              className="object-cover object-[64%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent sm:from-ink/55" />

            {/* spinning sticker */}
            <div className="absolute left-4 top-4 size-24 sm:left-8 sm:top-8 sm:size-32">
              <svg viewBox="0 0 100 100" className="size-full animate-[spin_16s_linear_infinite]" aria-hidden>
                <defs>
                  <path id="circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
                </defs>
                <circle cx="50" cy="50" r="49" fill="#dcff3d" />
                <text fontSize="10.5" fontWeight="800" letterSpacing="2.2" fill="#0b0b0b" style={{ fontFamily: "var(--font-jetbrains)" }}>
                  <textPath href="#circle">ZIP IT · SWAP IT · WEAR IT · </textPath>
                </text>
              </svg>
              <span className="absolute inset-0 grid place-items-center font-black text-ink">
                <span className="display text-xl sm:text-3xl">3×</span>
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-4 sm:bottom-8 sm:left-8 sm:right-8">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-paper px-3.5 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-wider">
                  Jacket {taka(settings.jacket_price)}
                </span>
                <span className="rounded-full bg-acid px-3.5 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-wider">
                  Any {settings.pack_size} panels {taka(settings.pack_price)}
                </span>
                <span className="hidden rounded-full bg-ink/80 px-3.5 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-wider text-paper backdrop-blur sm:inline-block">
                  Cash on delivery
                </span>
              </div>
              <div className="w-36 sm:w-52 lg:w-60">
                <HeroSwapCard panels={heroPanels} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────────── PANEL MARQUEE ───────────── */}
      <section className="mt-16 overflow-hidden bg-ink py-8 sm:mt-24 sm:py-10" aria-label="Art panels">
        <div className="marquee-track flex w-max animate-marquee gap-3" style={{ ["--marquee-speed" as string]: "60s" }}>
          {[...panels, ...panels].map((p, i) => (
            <Link
              key={`${p.slug}-${i}`}
              href={`/panels/${p.slug}`}
              aria-hidden={i >= panels.length}
              tabIndex={i >= panels.length ? -1 : undefined}
              className="group relative block h-56 w-32 shrink-0 overflow-hidden rounded-xl sm:h-72 sm:w-40"
            >
              <Image src={p.image_url} alt={p.name} fill sizes="160px" className="object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute inset-x-2 bottom-2 truncate rounded-full bg-ink/80 px-2.5 py-1 text-center font-mono text-[0.58rem] uppercase tracking-wider text-paper opacity-0 backdrop-blur transition group-hover:opacity-100">
                {p.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────── HOW IT SWAPS ───────────── */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="How it swaps" title={<>Zip. Swap.<br />New jacket.</>}>
              A hidden three-sided zip frame holds the back panel. Swap the art without swapping the jacket.
            </SectionHeading>
            <LinkButton href="/how-it-works" variant="outline">
              See it step by step <Arrow />
            </LinkButton>
          </div>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SWAP_STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <li className="flex h-full flex-col rounded-3xl bg-ink p-5 text-paper">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-acid">0{i + 1}</span>
                    <span className="eyebrow text-paper/40">Step</span>
                  </div>
                  <SwapDiagram step={(i + 1) as 1 | 2 | 3 | 4} className="mx-auto my-4 max-w-[220px]" />
                  <h3 className="display-narrow text-2xl">{s.title}</h3>
                  <p className="mt-2 text-sm text-paper/65">{s.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* ───────────── SWAP STUDIO ───────────── */}
      <section className="halftone-dark py-20 text-paper sm:py-28" id="studio">
        <Container>
          <SectionHeading eyebrow="Swap studio" title={<>Try it on.<br />Right here.</>} light>
            Tap any design to zip it into the back of the jacket. Find your favourites, add them to your pack.
          </SectionHeading>
          <div className="mt-12">
            <SwapStudio panels={panels} />
          </div>
        </Container>
      </section>

      {/* ───────────── 4-IN-1 SET ───────────── */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] bg-acid p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-16">
            <div className="relative mx-auto flex w-full max-w-lg items-end justify-center">
              <div className="relative z-10 w-[52%] -rotate-3 overflow-hidden rounded-2xl bg-studio shadow-2xl" style={{ aspectRatio: `${ASSET_SIZES.jacketFront.width}/${ASSET_SIZES.jacketFront.height}` }}>
                <Image src={asset(ASSETS.jacketFront)} alt="Front of the Wronge denim jacket" fill sizes="(min-width:1024px) 22vw, 45vw" className="object-cover" />
              </div>
              <div className="-ml-[10%] flex w-[52%] items-end">
                {showcase.slice(0, 3).map((p, i) => (
                  <div
                    key={p.slug}
                    className="relative aspect-[4/7] w-1/2 shrink-0 overflow-hidden rounded-xl border-4 border-acid shadow-xl first:ml-0 [&:not(:first-child)]:-ml-[22%]"
                    style={{ transform: `rotate(${(i - 1) * 7}deg) translateY(${i === 1 ? -14 : 0}px)`, zIndex: 20 + i }}
                  >
                    <Image src={p.image_url} alt={p.name} fill sizes="140px" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow">The {settings.pack_size + 1}-in-1 set</p>
              <h2 className="display mt-4 text-5xl sm:text-7xl">
                {settings.pack_size + 1} looks.
                <br />1 jacket.
              </h2>
              <p className="mt-5 max-w-md text-base text-ink/75 sm:text-lg">
                The jacket comes with its blank denim panel. Add any {settings.pack_size} art panels and you have {settings.pack_size + 1}{" "}
                completely different jackets in one.
              </p>
              <dl className="mt-8 max-w-md divide-y divide-ink/15 border-y border-ink/15 font-mono text-sm">
                <div className="flex justify-between py-3">
                  <dt>Jacket + blank panel</dt>
                  <dd className="font-bold">{taka(settings.jacket_price)}</dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt>Any {settings.pack_size} art panels</dt>
                  <dd className="font-bold">{taka(settings.pack_price)}</dd>
                </div>
                {settings.bundle_discount > 0 && (
                  <div className="flex justify-between py-3">
                    <dt>Set saving</dt>
                    <dd className="font-bold">−{taka(settings.bundle_discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between py-3 text-base">
                  <dt className="font-bold">The set</dt>
                  <dd className="font-black">{taka(setPrice)}</dd>
                </div>
              </dl>
              <LinkButton href="/build" variant="ink" size="lg" className="mt-8">
                Build my set <Arrow />
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────────── SHOP BY VIBE ───────────── */}
      <section className="pb-20 sm:pb-28">
        <Container>
          <SectionHeading eyebrow="Shop by vibe" title={<>Let your back<br />do the talking.</>} />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {categories.map((c, i) => (
              <Reveal key={c.name} delay={(i % 3) * 0.06}>
                <Link href={`/panels?category=${encodeURIComponent(c.name)}`} className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-ink sm:aspect-[16/10]">
                  <div className="absolute inset-0 flex">
                    {c.panels.slice(0, 3).map((p) => (
                      <div key={p.slug} className="relative h-full flex-1">
                        <Image src={p.image_url} alt="" fill sizes="(min-width:1024px) 11vw, 16vw" className="object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90" />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-2 sm:inset-x-6 sm:bottom-6">
                    <div>
                      <p className="display-narrow text-xl text-paper sm:text-3xl">{c.name}</p>
                      <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-widest text-paper/60">{c.panels.length} designs</p>
                    </div>
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-acid text-ink transition group-hover:rotate-[-45deg] sm:size-12">→</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────────── FEATURED PANELS ───────────── */}
      <section className="border-t border-line py-20 sm:py-28">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Fresh on the rack" title="Fan favourites" />
            <LinkButton href="/panels" variant="outline">
              All {panels.length} panels <Arrow />
            </LinkButton>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
            {showcase.map((p) => (
              <PanelCard key={p.slug} panel={p} />
            ))}
          </div>
        </Container>
      </section>

      {/* ───────────── WHY WRONGE ───────────── */}
      <section className="bg-paper-2 py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Why Wronge" title={<>Wear it wrong.<br />Wear it yours.</>} align="center" />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Art you can swap",
                b: "Original designs, from moody night skies to campus landmarks. Change your jacket as often as your mood.",
              },
              {
                n: "02",
                t: "Make your own",
                b: "Upload your own art, photo or logo and we'll print it as a panel that zips straight into your jacket.",
              },
              {
                n: "03",
                t: "Buy art, not jackets",
                b: "One well-made denim jacket and lots of new looks. Less waste, more you. Every panel fits every Wronge jacket.",
              },
            ].map((c, i) => (
              <Reveal key={c.n} delay={i * 0.08}>
                <div className="stitch-dark flex h-full flex-col rounded-3xl bg-paper p-7 sm:p-9">
                  <span className="font-mono text-sm font-bold text-muted">{c.n}</span>
                  <h3 className="display-narrow mt-10 text-3xl">{c.t}</h3>
                  <p className="mt-3 text-muted">{c.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────────── CUSTOM CTA ───────────── */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] bg-ink p-6 text-paper sm:p-10 lg:grid-cols-2 lg:p-16">
            <div className="order-2 lg:order-1">
              <p className="eyebrow text-acid">Create your own</p>
              <h2 className="display mt-4 text-5xl sm:text-7xl">
                Your art.
                <br />
                Your back.
              </h2>
              <p className="mt-5 max-w-md text-paper/70 sm:text-lg">
                Got a drawing, a photo, your band&apos;s logo or your crew&apos;s inside joke? Upload it, position it, and it takes one slot in your
                pack. We check every design before we print.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href="/custom" size="lg">
                  Upload your art <Arrow />
                </LinkButton>
              </div>
            </div>
            <div className="order-1 mx-auto w-full max-w-md lg:order-2">
              <div className="relative">
                <JacketBack panel={null} />
                <div
                  className="absolute grid place-items-center rounded-sm border-2 border-dashed border-acid bg-ink/60 text-center"
                  style={{ left: `${BACK_PANEL_RECT.left}%`, top: `${BACK_PANEL_RECT.top}%`, width: `${BACK_PANEL_RECT.width}%`, height: `${BACK_PANEL_RECT.height}%` }}
                >
                  <span className="px-2 font-mono text-[0.6rem] font-bold uppercase leading-tight tracking-widest text-acid sm:text-xs">
                    Your
                    <br />
                    art
                    <br />
                    here
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────────── REVIEWS ───────────── */}
      {reviews.length > 0 && (
        <section className="border-t border-line py-20 sm:py-28">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow="Word on the street" title="Real reviews" />
              <LinkButton href="/reviews" variant="outline">
                Read all <Arrow />
              </LinkButton>
            </div>
            <div className="no-scrollbar -mx-4 mt-10 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
              {reviews.slice(0, 8).map((r) => (
                <figure key={r.id} className="w-[85%] shrink-0 snap-start rounded-3xl border border-line bg-paper p-6 sm:w-[380px]">
                  <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={i < r.rating ? "size-4 fill-ink text-ink" : "size-4 text-line"} />
                    ))}
                  </div>
                  {r.title && <p className="mt-4 font-bold uppercase">{r.title}</p>}
                  <blockquote className="mt-2 line-clamp-5 text-muted">{r.body}</blockquote>
                  <figcaption className="mt-5 font-mono text-xs uppercase tracking-wider">
                    {r.name}
                    {r.location && <span className="text-muted"> · {r.location}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ───────────── FAQ ───────────── */}
      <section className="border-t border-line py-20 sm:py-28">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="FAQ" title={<>Good<br />questions.</>}>
              Still curious? There&apos;s more on the{" "}
              <Link href="/faq" className="font-semibold text-ink underline underline-offset-4">
                FAQ page
              </Link>
              , or just message us.
            </SectionHeading>
          </div>
          <div className="lg:col-span-8">
            <FaqList faqs={faqs} />
          </div>
        </Container>
      </section>

      {/* ───────────── REASSURANCE ───────────── */}
      <section className="border-t border-line bg-paper-2">
        <Container className="grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
          {[
            { Icon: Banknote, t: "Cash on delivery", b: "Pay the rider when it arrives" },
            { Icon: MapPin, t: "All 64 districts", b: `From ${taka(settings.delivery_inside_dhaka)} delivery` },
            { Icon: RefreshCcw, t: "Easy size exchange", b: "Within 7 days of delivery" },
            { Icon: Layers, t: "One standard size", b: "Every panel fits every jacket" },
          ].map(({ Icon, t, b }) => (
            <div key={t} className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-acid">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-tight">{t}</p>
                <p className="text-xs text-muted">{b}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
