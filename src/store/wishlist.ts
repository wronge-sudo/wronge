"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type WishlistState = {
  slugs: string[];
  toggle: (slug: string) => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const { slugs } = get();
        set({ slugs: slugs.includes(slug) ? slugs.filter((s) => s !== slug) : [...slugs, slug] });
      },
    }),
    { name: "wronge-wishlist", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);
