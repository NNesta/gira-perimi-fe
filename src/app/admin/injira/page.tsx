import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { Logo } from "@/components/brand/logo";
import { ThemeMenu } from "@/components/theme/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionAdmin } from "@/lib/api-server";

export const metadata: Metadata = { title: "Ubuyobozi · Injira", robots: { index: false, follow: false } };

async function LoginPanel() {
  if (await getSessionAdmin()) redirect("/admin");
  return <AdminLoginForm />;
}

/**
 * Admin sign-in (email + password). Internal: proxy.ts serves it only at the private ADMIN_LOGIN_PATH, never at
 * /admin/injira, and nothing on the site links to it.
 */
export default function AdminLoginPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-asphalt px-4 py-12">
      <div aria-hidden className="bg-grid absolute inset-0 opacity-10" />
      <div aria-hidden className="absolute -left-20 -top-20 size-96 rounded-full bg-brand-500/25 blur-3xl" />
      <div aria-hidden className="absolute -bottom-24 -right-16 size-96 rounded-full bg-ocean-500/25 blur-3xl" />
      <ThemeMenu onDark className="absolute right-4 top-4" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo onDark />
        </div>
        <div className="card p-7 sm:p-9">
          <p className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">
            <ShieldCheck className="size-4 text-brand-500" /> Ubuyobozi
          </p>
          <h1 className="mt-4 text-3xl font-extrabold">Injira nk’umuyobozi</h1>
          <p className="mt-2 text-muted">Iki gice ni icy’abayobozi ba Tsinda Neza gusa.</p>
          <div className="mt-7">
            <Suspense fallback={<Skeleton className="h-60 rounded-2xl" />}>
              <LoginPanel />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
