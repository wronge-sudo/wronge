"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PanelRef } from "@/lib/types";

/** The "pack tray": the panels a shopper is currently picking for a pack. */
type PackState = {
  panels: PanelRef[];
  toggle: (panel: PanelRef, max: number) => "added" | "removed" | "full";
  add: (panel: PanelRef, max: number) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
};

export const usePack = create<PackState>()(
  persist(
    (set, get) => ({
      panels: [],
      toggle: (panel, max) => {
        const { panels } = get();
        if (panels.some((p) => p.slug === panel.slug)) {
          set({ panels: panels.filter((p) => p.slug !== panel.slug) });
          return "removed";
        }
        if (panels.length >= max) return "full";
        set({ panels: [...panels, panel] });
        return "added";
      },
      add: (panel, max) => {
        const { panels } = get();
        if (panels.some((p) => p.slug === panel.slug)) return true;
        if (panels.length >= max) return false;
        set({ panels: [...panels, panel] });
        return true;
      },
      remove: (slug) => set({ panels: get().panels.filter((p) => p.slug !== slug) }),
      clear: () => set({ panels: [] }),
      has: (slug) => get().panels.some((p) => p.slug === slug),
    }),
    { name: "wronge-pack", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);
