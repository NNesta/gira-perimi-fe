import { LogIn } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { Logo } from "@/components/brand/logo";
import { ThemeMenu } from "@/components/theme/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/api-server";

import { NavLinks, NavLinksView } from "./nav-links";
import { UserMenu } from "./user-menu";

async function HeaderAccount() {
  const user = await getSessionUser();
  if (user) return <UserMenu user={user} />;
  return (
    <ButtonLink href="/injira" size="sm" className="h-10 px-4">
      <LogIn className="size-4" aria-hidden />
      Injira
    </ButtonLink>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-surface/80 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/70">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Tsinda Neza, ahabanza" className="rounded-xl">
          <Logo />
        </Link>
        <Suspense fallback={<NavLinksView pathname="" />}>
          <NavLinks />
        </Suspense>
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeMenu />
          <Suspense fallback={<Skeleton className="h-10 w-24 rounded-full" />}>
            <HeaderAccount />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
