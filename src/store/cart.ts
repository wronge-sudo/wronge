"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { SIZES } from "@/config/site";
import type { CartLine } from "@/lib/pricing";

type NewLine = { size: string; qty?: number };

type CartState = {
  lines: CartLine[];
  open: boolean;
  add: (line: NewLine) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

const newKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 12)
    : Math.random().toString(36).slice(2, 14);

const clampQty = (n: number) => Math.max(1, Math.min(10, n));

/**
 * Bags saved before the single-package store (version 1) held jackets, panel packs and sets.
 * Jackets and sets become a package in the same size. Panel packs and sizes no longer sold are dropped.
 */
function migrateLines(old: unknown): CartLine[] {
  const lines = (old as { lines?: { type?: string; size?: unknown; qty?: unknown }[] } | undefined)?.lines ?? [];
  const bySize = new Map<string, number>();
  for (const l of lines) {
    if (l.type !== "jacket" && l.type !== "bundle") continue;
    if (typeof l.size !== "string" || !(SIZES as readonly string[]).includes(l.size)) continue;
    bySize.set(l.size, (bySize.get(l.size) ?? 0) + (Number(l.qty) || 1));
  }
  return [...bySize].map(([size, qty]) => ({ key: newKey(), type: "package", size, qty: clampQty(qty) }));
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      add: (line) =>
        set((state) => {
          const qty = Math.max(1, line.qty ?? 1);
          const existing = state.lines.find((l) => l.size === line.size);
          if (existing) {
            return {
              open: true,
              lines: state.lines.map((l) => (l.key === existing.key ? { ...l, qty: clampQty(l.qty + qty) } : l)),
            };
          }
          return { open: true, lines: [...state.lines, { key: newKey(), type: "package", size: line.size, qty: clampQty(qty) }] };
        }),
      setQty: (key, qty) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.key === key ? { ...l, qty: clampQty(qty) } : l)),
        })),
      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "wronge-cart",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      migrate: (persisted, version) => (version < 2 ? { lines: migrateLines(persisted) } : persisted) as { lines: CartLine[] },
    },
  ),
);
