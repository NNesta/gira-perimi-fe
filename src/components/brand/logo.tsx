import { useId } from "react";

import { cn } from "@/lib/cn";

/** Brand mark: a winding road over the hills, with the sun of the Rwandan flag. */
export function LogoMark({ className }: { className?: string }) {
  // Unique per instance: a duplicated id inside a hidden copy would blank the visible one's gradient.
  const gradientId = `gp-logo-${useId()}`;
  return (
    <svg viewBox="0 0 48 48" className={cn("size-10", className)} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#129b68" />
          <stop offset="1" stopColor="#0077b8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${gradientId})`} />
      <circle cx="35" cy="13" r="5.5" fill="#fad201" />
      <path d="M0 33c7-6 14-7 22-4s16 2 26-6v25H0z" fill="#ffffff" opacity="0.16" />
      <path
        d="M17 48c1-7 6-11 11-14s7-7 5-12c-1-3 0-5 3-7"
        fill="none"
        stroke="#ffffff"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M17 48c1-7 6-11 11-14s7-7 5-12c-1-3 0-5 3-7"
        fill="none"
        stroke="#fad201"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="3 3.2"
      />
    </svg>
  );
}

export function Logo({
  className,
  compact = false,
  onDark = false,
}: {
  className?: string;
  compact?: boolean;
  onDark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-9 shrink-0 drop-shadow-sm" />
      {!compact && (
        <span className={cn("font-display text-xl font-extrabold leading-none tracking-tight", onDark ? "text-white" : "text-ink")}>
          Gira<span className={onDark ? "text-brand-300" : "text-brand-600 dark:text-brand-400"}>Perimi</span>
        </span>
      )}
    </span>
  );
}
