import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Tone = "brand" | "ocean" | "sun" | "signal" | "neutral" | "dark";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-200/70 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-400/25",
  ocean: "bg-ocean-50 text-ocean-700 ring-ocean-200/70 dark:bg-ocean-500/15 dark:text-ocean-300 dark:ring-ocean-400/25",
  sun: "bg-sun-50 text-sun-700 ring-sun-200/80 dark:bg-sun-400/15 dark:text-sun-300 dark:ring-sun-300/25",
  signal: "bg-signal-50 text-signal-700 ring-signal-200/70 dark:bg-signal-500/15 dark:text-signal-200 dark:ring-signal-400/25",
  neutral: "bg-surface-2 text-ink-soft ring-line",
  dark: "bg-asphalt text-white ring-asphalt dark:bg-white dark:text-asphalt dark:ring-white",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
