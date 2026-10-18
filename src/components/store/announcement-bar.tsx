import { taka } from "@/lib/format";
import type { StoreSettings } from "@/lib/types";

export function AnnouncementBar({ settings }: { settings: StoreSettings }) {
  const custom = (settings.announcement || "Cash on delivery all over Bangladesh")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  const items = [
    ...custom,
    `Any ${settings.pack_size} art panels for ${taka(settings.pack_price)}`,
    "One jacket. Endless backs.",
    settings.free_delivery_min
      ? `Free delivery over ${taka(settings.free_delivery_min)}`
      : `Delivery ${taka(settings.delivery_inside_dhaka)} inside Dhaka`,
    "Swap your back panel in under a minute",
  ];
  const row = [...items, ...items];

  return (
    <div className="relative overflow-hidden bg-primary text-paper" role="region" aria-label="Announcements">
      <div className="marquee-track flex w-max animate-marquee py-2" style={{ ["--marquee-speed" as string]: "45s" }}>
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {row.map((t, i) => (
              <li key={`${copy}-${i}`} className="flex items-center whitespace-nowrap px-5 font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em]">
                {t}
                <span className="ml-10 inline-block size-1.5 rotate-45 bg-paper/60" aria-hidden />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
