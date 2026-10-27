"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { JACKET_ASPECT, JacketBack } from "@/components/store/jacket-back";

export type WallItem =
  | { kind: "photo"; key: string; image: string; name: string }
  | { kind: "review"; key: string; body: string; name: string; panel: string | null };

// Two copies are enough because page.tsx pads each row past the widest screen.
const COPIES = 2;

/**
 * One endless row. It drifts with page scroll (rows move in opposite directions)
 * and can be dragged sideways. The second copy is hidden from assistive tech.
 */
function MarqueeRow({ children, dir }: { children: ReactNode; dir: 1 | -1 }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = wrap.current;
    const t = track.current;
    const set = t?.firstElementChild as HTMLElement | null;
    if (!w || !t || !set) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let drag = 0;
    let startX = 0;
    let startDrag = 0;
    let moved = 0;
    let pointer: number | null = null;
    let raf = 0;
    let visible = false;

    const render = () => {
      raf = 0;
      const width = set.offsetWidth;
      if (!width) return;
      const scrolled = reduce ? 0 : -w.getBoundingClientRect().top * 0.45 * dir;
      let x = (scrolled + drag - (dir === 1 ? width : 0)) % width;
      if (x > 0) x -= width;
      t.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };
    const onScroll = () => {
      if (visible) queue();
    };
    const down = (e: PointerEvent) => {
      pointer = e.pointerId;
      startX = e.clientX;
      startDrag = drag;
      moved = 0;
    };
    const move = (e: PointerEvent) => {
      if (pointer !== e.pointerId) return;
      // Released outside the row before capture kicked in: end the drag here.
      if (!e.buttons) {
        pointer = null;
        return;
      }
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 4 && !w.hasPointerCapture(e.pointerId)) w.setPointerCapture(e.pointerId);
      drag = startDrag + dx;
      queue();
    };
    const up = (e: PointerEvent) => {
      if (pointer === e.pointerId) pointer = null;
    };
    // A drag shouldn't also count as a click on whatever is under the pointer.
    const click = (e: MouseEvent) => {
      if (moved > 4) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Only follow page scroll while the row is on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) queue();
    });
    render();
    io.observe(w);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    w.addEventListener("pointerdown", down);
    w.addEventListener("pointermove", move);
    w.addEventListener("pointerup", up);
    w.addEventListener("pointercancel", up);
    w.addEventListener("click", click, true);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      w.removeEventListener("pointerdown", down);
      w.removeEventListener("pointermove", move);
      w.removeEventListener("pointerup", up);
      w.removeEventListener("pointercancel", up);
      w.removeEventListener("click", click, true);
    };
  }, [dir]);

  return (
    <div ref={wrap} className="cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing [&_img]:pointer-events-none">
      <div ref={track} className="flex w-max items-center will-change-transform">
        {Array.from({ length: COPIES }, (_, k) => (
          <div key={k} className="flex shrink-0 items-center gap-6 pr-6" aria-hidden={k > 0 || undefined} inert={k > 0}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

function Item({ item }: { item: WallItem }) {
  if (item.kind === "photo") {
    return (
      <figure className="w-[200px] shrink-0 rounded-[10px] bg-card p-[6.8px] sm:w-[240px]">
        <div className="relative aspect-[226/302] overflow-hidden rounded-[1.7px] bg-studio">
          <div className="absolute left-1/2 top-1/2 h-full -translate-x-1/2 -translate-y-1/2" style={{ aspectRatio: JACKET_ASPECT }}>
            <JacketBack panel={{ image: item.image, name: item.name }} rounded={false} sizes="300px" />
          </div>
        </div>
      </figure>
    );
  }
  return (
    <figure className="w-[280px] shrink-0 px-[4.25px] py-[17px] sm:w-[320px]">
      <blockquote className="relative rounded-[21.25px] border border-ink/10 bg-cream px-[17px] py-[11px] text-ink shadow-[0_3px_10px_rgb(0_0_0/0.07)]">
        <p className="relative z-[1] line-clamp-4 text-[1.05rem] leading-[1.55] sm:text-[1.2rem]">{item.body}</p>
        {/* speech-bubble tail */}
        <svg viewBox="0 0 20 14" className="absolute -bottom-[11px] left-0 h-[14px] w-5 text-cream" aria-hidden>
          <path d="M0 14 L4 0 H20 Z" fill="currentColor" />
        </svg>
      </blockquote>
      <figcaption className="mt-[21px] text-right text-[1.05rem] font-bold leading-[1.55] text-cream sm:text-[1.2rem]">
        {item.name}
        {item.panel && ` · ${item.panel}`}
      </figcaption>
    </figure>
  );
}

export function ReviewWall({ rows }: { rows: [WallItem[], WallItem[]] }) {
  return (
    <div className="grid gap-[25.5px]">
      {rows.map((row, i) => (
        <MarqueeRow key={i} dir={i === 0 ? 1 : -1}>
          {row.map((item) => (
            <Item key={item.key} item={item} />
          ))}
        </MarqueeRow>
      ))}
    </div>
  );
}
