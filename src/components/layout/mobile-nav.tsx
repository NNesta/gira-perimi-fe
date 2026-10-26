"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

import { isActive, MOBILE_NAV } from "./nav-config";

/** App-style bottom tab bar on phones. Hidden while an exam is running so nothing distracts. */
export function MobileNav() {
  return <MobileNavView pathname={usePathname()} />;
}

export function MobileNavView({ pathname }: { pathname: string }) {
  const inExam = /^\/ikizamini\/[^/]+/.test(pathname) || pathname.startsWith("/imyitozo/kwitoza");
  if (inExam || pathname.startsWith("/injira")) return null;
  return (
    <nav
      aria-label="Ibice by’ingenzi"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 pb-2 pt-2.5 text-[0.7rem] font-semibold transition-colors",
                  active ? "text-brand-600 dark:text-brand-300" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-14 place-items-center rounded-full transition-all",
                    active && "bg-brand-100 dark:bg-brand-500/20",
                  )}
                >
                  <Icon className="size-[1.2rem]" aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
