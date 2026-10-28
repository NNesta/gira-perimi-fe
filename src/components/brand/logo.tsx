import { useId } from "react";

import { cn } from "@/lib/cn";

const ROAD = "M10 25.5 18.6 34c3.2-6.4 8.8-13.3 16.4-19.6";

/** Brand mark: a road that bends into a check mark ("tsinda", pass) and runs up to the sun of the Rwandan flag. */
export function LogoMark({ className }: { className?: string }) {
  // Unique per instance: a duplicated id inside a hidden copy would blank the visible one's gradient.
  const id = useId();
  const gradientId = `tn-logo-${id}`;
  const clipId = `tn-clip-${id}`;
  return (
    <svg viewBox="0 0 48 48" className={cn("size-10", className)} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#129b68" />
          <stop offset="1" stopColor="#0077b8" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect width="48" height="48" rx="13" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="48" height="48" fill={`url(#${gradientId})`} />
        <path d="M0 36c8-5 15-6 23-3s16 2 25-5v20H0z" fill="#ffffff" opacity="0.13" />
      </g>
      <circle cx="37" cy="11.2" r="5.4" fill="#fad201" />
      <path d={ROAD} fill="none" stroke="#ffffff" strokeWidth="7.6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d={ROAD}
        fill="none"
        stroke="#fad201"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2.4 2.7"
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
        <span
          data-wordmark
          className={cn("font-display text-xl font-extrabold leading-none tracking-tight", onDark ? "text-white" : "text-ink")}
        >
          Tsinda<span className={onDark ? "text-brand-300" : "text-brand-600 dark:text-brand-400"}>Neza</span>
        </span>
      )}
    </span>
  );
}
