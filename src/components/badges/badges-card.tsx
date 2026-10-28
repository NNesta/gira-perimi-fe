import { ArrowRight, Award } from "lucide-react";
import Link from "next/link";

import { BadgeMedal } from "@/components/badges/badge-medal";
import type { Badges } from "@/lib/types";

/** Dashboard summary: earned badges first, then the ones closest to being earned. */
export function BadgesCard({ badges }: { badges: Badges }) {
  const shown = [...badges.items]
    .sort((a, b) => Number(b.earned) - Number(a.earned) || b.current / b.target - a.current / a.target)
    .slice(0, 6);
  const next = badges.items
    .filter((b) => !b.earned)
    .sort((a, b) => b.current / b.target - a.current / a.target)[0];
  return (
    <Link href="/ibihembo" className="card group block p-5 transition hover:-translate-y-0.5 hover:shadow-lift sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-bold">
          <Award className="size-5 text-sun-600 dark:text-sun-300" aria-hidden /> Ibihembo
          <span className="text-sm font-semibold text-muted">
            {badges.earned}/{badges.total}
          </span>
        </p>
        <ArrowRight className="size-5 text-muted transition group-hover:translate-x-1" aria-hidden />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {shown.map((badge) => (
          <BadgeMedal key={badge.id} badge={badge} size={44} />
        ))}
      </div>
      {next && (
        <p className="mt-4 text-sm text-muted">
          Igikurikira: <span className="font-semibold text-ink">{next.title}</span> · {next.current}/{next.target}
        </p>
      )}
    </Link>
  );
}
