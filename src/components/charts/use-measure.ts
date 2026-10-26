"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Tracks an element's content width so charts draw in real pixels (crisp 2px lines, round markers).
 * Returns null until measured: charts render a same-height placeholder on the server, so a guessed
 * width can never push a narrow (phone) layout sideways.
 */
export function useMeasuredWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setWidth(Math.max(240, Math.round(element.getBoundingClientRect().width)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Clean axis maximum: 4 → 5, 13 → 15, 37 → 40, 120 → 150. */
export function niceMax(value: number): number {
  if (value <= 4) return Math.max(1, Math.ceil(value));
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    if (step * magnitude >= value) return step * magnitude;
  }
  return 10 * magnitude;
}
