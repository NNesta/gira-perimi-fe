"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type MouseEvent } from "react";

import { cn } from "@/lib/cn";

// Pages changed inside the app since it loaded in this tab: above 0, the browser's "back" stays on the site.
let depth = 0;
let lastPath: string | null = null;

/** Counts in-app page changes, so BackButton knows whether going back would leave the site. */
export function HistoryTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (lastPath !== null && lastPath !== pathname) depth += 1;
    lastPath = pathname;
  }, [pathname]);
  return null;
}

/**
 * Returns to the page the learner came from. Opened from a shared link or a fresh tab, it goes to `href` instead.
 * `icon`: the square button beside a running quiz; otherwise an arrow with "Subira inyuma".
 */
export function BackButton({ href, icon = false, className }: { href: string; icon?: boolean; className?: string }) {
  const router = useRouter();

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (depth === 0 || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    router.back();
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={icon ? "Subira inyuma" : undefined}
      className={cn(
        "text-muted transition hover:text-ink",
        icon
          ? "grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface"
          : "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-sm font-semibold backdrop-blur",
        className,
      )}
    >
      <ArrowLeft className={icon ? "size-5" : "size-4"} aria-hidden />
      {!icon && "Subira inyuma"}
    </Link>
  );
}
