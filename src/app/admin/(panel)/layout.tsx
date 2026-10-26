import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdminLogoutButton, AdminNav, AdminNavView } from "@/components/admin/admin-nav";
import { Logo } from "@/components/brand/logo";
import { ThemeMenu, ThemeSegmented } from "@/components/theme/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { getSessionAdmin } from "@/lib/api-server";

export const metadata: Metadata = {
  title: { default: "Ubuyobozi", template: "%s · Ubuyobozi · Gira Perimi" },
  robots: { index: false, follow: false },
};

/** Renders the panel only for a signed-in admin; anyone else (even with a forged cookie) gets the ordinary 404. */
async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await getSessionAdmin();
  if (!admin) notFound();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 z-40 bg-asphalt text-white lg:h-dvh">
        <div className="flex h-16 items-center justify-between gap-2 px-3 sm:px-4 lg:h-auto lg:flex-col lg:items-stretch lg:gap-8 lg:px-5 lg:py-6">
          <Link href="/admin" aria-label="Ubuyobozi, incamake" className="shrink-0 text-white">
            <Logo onDark compact className="lg:hidden" />
            <Logo onDark className="hidden lg:inline-flex" />
          </Link>
          <div className="hidden lg:block">
            <p className="px-3.5 pb-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/40">Ubuyobozi</p>
            <Suspense fallback={<AdminNavView pathname="" />}>
              <AdminNav />
            </Suspense>
          </div>
          <div className="flex min-w-0 items-center gap-1 lg:hidden">
            <Suspense fallback={<AdminNavView pathname="" vertical={false} />}>
              <AdminNav vertical={false} />
            </Suspense>
            <ThemeMenu onDark />
            <AdminLogoutButton compact />
          </div>
        </div>
        <div className="absolute inset-x-5 bottom-6 hidden space-y-2 lg:block">
          <p className="px-1 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/40">Amabara y’urubuga</p>
          <ThemeSegmented onDark iconsOnly className="mb-2 w-full" />
          <div className="flex items-center gap-3 rounded-2xl bg-white/6 p-3">
            <Avatar name={admin.name} size={36} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{admin.name}</p>
              <p className="truncate text-xs text-white/55">{admin.email}</p>
            </div>
          </div>
          <AdminLogoutButton />
          <Link href="/" className="block px-3.5 text-xs font-semibold text-white/45 hover:text-white">
            ← Subira ku rubuga
          </Link>
        </div>
      </aside>
      <main className="min-w-0 bg-bg">{children}</main>
    </div>
  );
}

export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense
      fallback={
        <div aria-hidden className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
          <div className="h-16 bg-asphalt lg:h-dvh" />
        </div>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
