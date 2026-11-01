"use client";
import { createContext, use, type ReactNode } from "react";
import type { PanelRef, SizeRow, StoreSettings } from "@/lib/types";

/** `packagePanels`: the art panels that ship in every 4-in-1 package (config/package.ts). */
type StoreData = { settings: StoreSettings; sizes: SizeRow[]; packagePanels: PanelRef[] };

const StoreDataContext = createContext<StoreData | null>(null);

export function StoreDataProvider({ value, children }: { value: StoreData; children: ReactNode }) {
  return <StoreDataContext value={value}>{children}</StoreDataContext>;
}

export function useStoreData(): StoreData {
  const ctx = use(StoreDataContext);
  if (!ctx) throw new Error("useStoreData must be used inside <StoreDataProvider>");
  return ctx;
}
