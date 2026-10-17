"use client";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Heart, Search, X } from "lucide-react";
import type { Panel } from "@/lib/types";
import { cn } from "@/lib/format";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/lib/use-mounted";
import { PanelCard } from "./panel-card";
import { TryOnModal } from "./try-on-modal";

type Sort = "featured" | "new" | "az";

export function PanelBrowserFromParams({ panels }: { panels: Panel[] }) {
  const params = useSearchParams();
  return (
    <PanelBrowser
      key={`${params.get("category")}-${params.get("saved")}`}
      panels={panels}
      initialCategory={params.get("category")}
      initialSaved={params.get("saved") === "1"}
    />
  );
}

export function PanelBrowser({
  panels,
  initialCategory = null,
  initialSaved = false,
}: {
  panels: Panel[];
  initialCategory?: string | null;
  initialSaved?: boolean;
}) {
  const mounted = useMounted();
  const categories = useMemo(() => Array.from(new Set(panels.map((p) => p.category))), [panels]);
  const [category, setCategory] = useState<string | null>(
    initialCategory && categories.includes(initialCategory) ? initialCategory : null,
  );
  const [savedOnly, setSavedOnly] = useState(initialSaved);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const [preview, setPreview] = useState<Panel | null>(null);
  const saved = useWishlist((s) => s.slugs);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = panels.filter(
      (p) =>
        (!category || p.category === category) &&
        (!savedOnly || !mounted || saved.includes(p.slug)) &&
        (!q || `${p.name} ${p.category} ${p.artist} ${p.description ?? ""}`.toLowerCase().includes(q)),
    );
    if (sort === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "new") list = [...list].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "") || b.sort_order - a.sort_order);
    if (sort === "featured") list = [...list].sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order);
    return list;
  }, [panels, category, savedOnly, saved, mounted, query, sort]);

  const chip = (active: boolean) =>
    cn(
      "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-xs font-bold uppercase tracking-wider transition",
      active ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink",
    );

  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-[72px] lg:-mx-10 lg:px-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            <button type="button" className={chip(!category && !savedOnly)} onClick={() => { setCategory(null); setSavedOnly(false); }}>
              All <span className="opacity-50">{panels.length}</span>
            </button>
            {categories.map((c) => (
              <button key={c} type="button" className={chip(category === c)} onClick={() => setCategory(category === c ? null : c)}>
                {c}
              </button>
            ))}
            <button type="button" className={chip(savedOnly)} onClick={() => setSavedOnly(!savedOnly)}>
              <Heart className={cn("size-3.5", savedOnly && "fill-current")} /> Saved {mounted && saved.length > 0 && <span className="opacity-60">{saved.length}</span>}
            </button>
          </div>
          <div className="flex gap-2 lg:ml-auto">
            <label className="relative flex-1 lg:w-64 lg:flex-none">
              <span className="sr-only">Search panels</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search designs…"
                className="h-10 w-full rounded-full border border-line bg-paper pl-10 pr-9 text-sm outline-none focus:border-ink"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full hover:bg-ink/5">
                  <X className="size-3.5" />
                </button>
              )}
            </label>
            <label className="sr-only" htmlFor="sort">Sort</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-10 rounded-full border border-line bg-paper px-4 text-xs font-bold uppercase tracking-wider outline-none focus:border-ink"
            >
              <option value="featured">Featured</option>
              <option value="new">Newest</option>
              <option value="az">A – Z</option>
            </select>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="display-narrow text-3xl">{savedOnly ? "No saved panels yet" : "Nothing matches that"}</p>
          <p className="mt-2 text-muted">
            {savedOnly ? "Tap the heart on any design to save it here." : "Try another word, or clear the filters."}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 pb-32 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {visible.map((p) => (
            <PanelCard key={p.slug} panel={p} onPreview={setPreview} />
          ))}
        </div>
      )}

      <TryOnModal panel={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
