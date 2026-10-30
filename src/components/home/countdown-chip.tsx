"use client";

import { Timer } from "lucide-react";
import { useEffect, useState } from "react";

import { formatDuration } from "@/lib/format";

/** The exam clock in the home page's feature card: starts at 18:42 and ticks down, like the real one. */
export function CountdownChip({ from = 18 * 60 + 42 }: { from?: number }) {
  const [left, setLeft] = useState(from);
  useEffect(() => {
    const id = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : from)), 1000);
    return () => window.clearInterval(id);
  }, [from]);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl bg-asphalt px-2.5 py-1 font-display text-sm font-extrabold tabular-nums text-white dark:bg-white dark:text-asphalt">
      <Timer className="size-3.5" aria-hidden />
      {formatDuration(left)}
    </span>
  );
}
