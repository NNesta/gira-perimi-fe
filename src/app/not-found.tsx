import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-16">
      <div aria-hidden className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div className="relative max-w-lg text-center">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
        {/* Sign E.14 "Inzira idakomeza" — a dead end */}
        <svg viewBox="0 0 120 150" className="mx-auto mt-10 h-44 w-auto drop-shadow-xl" aria-hidden>
          <rect x="56" y="96" width="8" height="54" rx="3" fill="#94a3b8" />
          <rect x="10" y="6" width="100" height="100" rx="14" fill="#0077b8" />
          <rect x="18" y="14" width="84" height="84" rx="9" fill="none" stroke="#ffffff" strokeWidth="3" />
          <rect x="50" y="40" width="20" height="50" fill="#ffffff" />
          <rect x="34" y="28" width="52" height="14" fill="#e5383f" />
        </svg>
        <p className="mt-8 font-display text-7xl font-extrabold text-gradient">404</p>
        <h1 className="mt-3 text-3xl font-extrabold">Iyi nzira ntikomeza</h1>
        <p className="mt-3 text-lg text-muted">
          Nk’uko icyapa E.14 kibivuga: urupapuro washakaga ntirubaho cyangwa rwarimuwe.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/" size="lg">
            <ArrowLeft className="size-5" /> Subira ahabanza
          </ButtonLink>
          <ButtonLink href="/amasomo" variant="secondary" size="lg">
            <BookOpen className="size-5" /> Amasomo
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
