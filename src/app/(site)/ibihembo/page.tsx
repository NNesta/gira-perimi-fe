import { CircleCheck } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { BadgeCelebration } from "@/components/badges/badge-celebration";
import { BadgeMedal } from "@/components/badges/badge-medal";
import { ProgressBar } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/section-heading";
import { PageSkeleton } from "@/components/ui/skeleton";
import { learnerFetch } from "@/lib/api-server";
import { cn } from "@/lib/cn";
import type { Badges, User } from "@/lib/types";

export const metadata: Metadata = { title: "Ibihembo", robots: { index: false } };

async function BadgeGrid() {
  const [badges, user] = await Promise.all([
    learnerFetch<Badges>("/me/badges", "/ibihembo"),
    learnerFetch<User>("/auth/me", "/ibihembo"),
  ]);
  return (
    <>
      <div className="card mb-8 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <p className="shrink-0 font-display text-3xl font-extrabold">
          {badges.earned}
          <span className="text-lg text-muted">/{badges.total}</span>
        </p>
        <div className="flex-1">
          <ProgressBar value={badges.earned} max={badges.total} label="Ibihembo wabonye" />
          <p className="mt-2 text-sm text-muted">Ibihembo wabonye. Komeza wige, ukore ibizamini, ugere ku bindi.</p>
        </div>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.items.map((badge) => (
          <li key={badge.id} className={cn("card flex items-center gap-4 p-5", !badge.earned && "bg-surface/70")}>
            <BadgeMedal badge={badge} size={68} />
            <div className="min-w-0 flex-1">
              <p className={cn("font-bold", !badge.earned && "text-ink-soft")}>{badge.title}</p>
              <p className="mt-0.5 text-sm text-muted">{badge.description}</p>
              {badge.earned ? (
                <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 dark:text-brand-300">
                  <CircleCheck className="size-4" aria-hidden /> Wakibonye
                </p>
              ) : (
                badge.target > 1 && (
                  <div className="mt-2 flex items-center gap-2">
                    <ProgressBar value={badge.current} max={badge.target} className="h-1.5" label={badge.title} />
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">
                      {badge.current}/{badge.target}
                    </span>
                  </div>
                )
              )}
            </div>
          </li>
        ))}
      </ul>
      <BadgeCelebration uid={user.id} badges={badges.items} />
    </>
  );
}

export default function BadgesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ibihembo"
        title="Ibihembo byawe"
        description="Buri gihembo kigaragaza intambwe watereye: ibizamini, iminsi wize udasiba, ibibazo wasubije n’amasomo warangije."
      />
      <div className="container-page py-10">
        <Suspense fallback={<PageSkeleton title={false} />}>
          <BadgeGrid />
        </Suspense>
      </div>
    </>
  );
}
