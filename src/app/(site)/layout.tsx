import { Suspense } from "react";

import { MobileNav, MobileNavView } from "@/components/layout/mobile-nav";
import { ConnectionBanner } from "@/components/pwa/connection-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#ibirimo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-surface focus:px-4 focus:py-2 focus:shadow-lift"
      >
        Jya ku birimo
      </a>
      <SiteHeader />
      <ConnectionBanner />
      <main id="ibirimo" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <Suspense fallback={<MobileNavView pathname="" />}>
        <MobileNav />
      </Suspense>
    </div>
  );
}
