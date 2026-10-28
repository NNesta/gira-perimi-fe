"use client";

import { useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import { applyTextSize, readTextSize, subscribeTextSize, TEXT_SIZE_LABELS, TEXT_SIZES } from "@/lib/text-size";

/** A− / A+ with the current size between them (tap it to go back to the usual size). */
export function TextSizeControl({ className }: { className?: string }) {
  // The server always renders the usual size; the client reads what the pre-paint script set on <html>.
  const size = useSyncExternalStore(subscribeTextSize, readTextSize, () => "md" as const);
  const index = TEXT_SIZES.indexOf(size);
  const step = (delta: number) => applyTextSize(TEXT_SIZES[Math.min(TEXT_SIZES.length - 1, Math.max(0, index + delta))]);
  const button =
    "grid h-10 min-w-11 place-items-center rounded-xl px-2 font-bold text-ink-soft transition hover:bg-surface-2 hover:text-ink disabled:opacity-35 disabled:hover:bg-transparent";

  return (
    <div
      role="group"
      aria-label="Ingano y’inyandiko"
      className={cn("inline-flex items-center gap-1 rounded-2xl border border-line bg-surface p-1 shadow-soft", className)}
    >
      <button type="button" onClick={() => step(-1)} disabled={index === 0} aria-label="Gabanya inyandiko" className={button}>
        <span className="text-sm">A−</span>
      </button>
      <button
        type="button"
        onClick={() => applyTextSize("md")}
        aria-live="polite"
        title="Subiza ingano isanzwe"
        className="h-10 min-w-20 rounded-xl px-2 text-sm font-semibold text-ink transition hover:bg-surface-2"
      >
        {TEXT_SIZE_LABELS[size]}
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={index === TEXT_SIZES.length - 1}
        aria-label="Ongera inyandiko"
        className={button}
      >
        <span className="text-lg">A+</span>
      </button>
    </div>
  );
}
