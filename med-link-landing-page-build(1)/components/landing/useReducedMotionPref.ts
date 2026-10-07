"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useLanding } from "./landing-context";

export function useReducedMotionPref() {
  const { reduceMotion, setReduceMotion, osReduceMotion } = useLanding();
  return { reduce: reduceMotion, setReduce: setReduceMotion, osReduce: osReduceMotion };
}

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useMemo(() => subscribeMedia(query), [query]);
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
