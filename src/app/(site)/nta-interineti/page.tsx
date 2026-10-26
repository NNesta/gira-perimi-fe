import { BookOpen, Signpost, Target, WifiOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { RetryLink } from "@/components/pwa/retry-link";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Nta interineti", robots: { index: false, follow: false } };

const SAVED = [
  { href: "/imyitozo/offline", label: "Imyitozo", hint: "Ibibazo n’ibisobanuro byabitswe", icon: Target },
  { href: "/amasomo", label: "Amasomo", hint: "Amasomo wabitse cyangwa wasomye", icon: BookOpen },
  { href: "/ibyapa", label: "Ibyapa", hint: "Ibyapa byose n’ibisobanuro byabyo", icon: Signpost },
];

/** Shown by the service worker when a page is not saved on this device and there is no connection. */
export default function OfflinePage() {
  return (
    <section className="container-page grid min-h-[70dvh] place-items-center py-14">
      <div className="max-w-xl text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-sun-100 text-sun-700 dark:bg-sun-400/15 dark:text-sun-300">
          <WifiOff className="size-8" aria-hidden />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">Nta interineti ufite</h1>
        <p className="mt-3 text-lg text-muted">
          Uru rupapuro ntirwabitswe kuri iki gikoresho. Ushobora gukomeza kwiga ibyo wabitse, cyangwa ukongera
          kugerageza interineti igarutse.
        </p>
        <ul className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {SAVED.map(({ href, label, hint, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                prefetch={false}
                className="card flex h-full flex-col gap-2 p-4 transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <Icon className="size-5 text-brand-600 dark:text-brand-300" aria-hidden />
                <span className="font-bold">{label}</span>
                <span className="text-sm text-muted">{hint}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Suspense fallback={null}>
            <RetryLink />
          </Suspense>
          <ButtonLink href="/" variant="secondary">
            Subira ahabanza
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
