"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during SSR / first paint, true once running in the browser. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
