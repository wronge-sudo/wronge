"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartLine } from "@/lib/pricing";
import type { PanelRef } from "@/lib/types";

type NewLine =
  | { type: "jacket"; size: string; qty?: number }
  | { type: "pack"; panels: PanelRef[]; qty?: number }
  | { type: "bundle"; size: string; panels: PanelRef[]; qty?: number };

type CartState = {
  lines: CartLine[];
  open: boolean;
  add: (line: NewLine) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

const panelSig = (panels: PanelRef[]) =>
  panels
    .map((p) => (p.custom ? `custom:${p.custom.publicId}` : p.slug))
    .sort()
    .join("|");

const sig = (l: NewLine | CartLine) => {
  if (l.type === "jacket") return `jacket:${l.size}`;
  if (l.type === "pack") return `pack:${panelSig(l.panels)}`;
  return `bundle:${l.size}:${panelSig(l.panels)}`;
};

const newKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 12)
    : Math.random().toString(36).slice(2, 14);

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      add: (line) =>
        set((state) => {
          const qty = Math.max(1, line.qty ?? 1);
          const existing = state.lines.find((l) => sig(l) === sig(line));
          if (existing) {
            return {
              open: true,
              lines: state.lines.map((l) =>
                l.key === existing.key ? { ...l, qty: Math.min(10, l.qty + qty) } : l,
              ),
            };
          }
          return { open: true, lines: [...state.lines, { ...line, qty, key: newKey() } as CartLine] };
        }),
      setQty: (key, qty) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(10, qty)) } : l)),
        })),
      remove: (key) => set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "wronge-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
    },
  ),
);
