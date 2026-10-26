"use client";
/* eslint-disable @next/next/no-img-element -- Google profile photos come from an external CDN */

import { useState } from "react";

import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

/** Profile photo, or the learner's initials when there is none or it fails to load (Google photo links expire). */
export function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const style = { width: size, height: size, fontSize: Math.max(11, size * 0.38) };
  if (src && src !== failedSrc) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src)}
        className={cn("shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-surface", className)}
        style={style}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-ocean-500 font-bold text-white ring-2 ring-white dark:ring-surface",
        className,
      )}
      style={style}
    >
      {initials(name)}
    </span>
  );
}
