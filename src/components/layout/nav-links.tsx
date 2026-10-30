"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

import { isActive, MAIN_NAV } from "./nav-config";

export function NavLinks() {
  return <NavLinksView pathname={usePathname()} />;
}

/** Pure view so layouts can render it as a Suspense fallback before the pathname is known. */
export function NavLinksView({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Ibice by’urubuga" className="hidden items-center gap-1 lg:flex">
      {MAIN_NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[0.95rem] font-semibold transition-colors",
              active ? "text-brand-700 dark:text-brand-300" : "text-ink-soft hover:bg-surface-2 hover:text-ink",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
            {active && (
              // Shared layoutId: the underline slides from the old section to the new one.
              <motion.span
                layoutId="nav-underline"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-x-3 -bottom-[13px] h-[3px] rounded-full bg-gradient-to-r from-brand-400 to-ocean-400"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
