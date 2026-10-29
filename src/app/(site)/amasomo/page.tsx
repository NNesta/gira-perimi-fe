import { CircleCheck, Clock, Lock, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ProgressBar } from "@/components/ui/progress";
import { PageHeader } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser, serverFetch } from "@/lib/api-server";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/format";
import { DynamicIcon } from "@/lib/icons";
import { pageShare } from "@/lib/site";
import type { LessonSummary } from "@/lib/types";

const DESCRIPTION =
  "Amasomo 16 y’amategeko y’umuhanda mu Kinyarwanda, ashingiye ku iteka rigenga umuhanda n’itegeko rishya rya 2026.";

export const metadata: Metadata = {
  title: "Amasomo",
  description: DESCRIPTION,
  ...pageShare("Amasomo y’amategeko y’umuhanda · Tsinda Neza", DESCRIPTION),
};

const ACCENTS = [
  "from-brand-500 to-brand-600",
  "from-ocean-500 to-ocean-600",
  "from-sun-300 to-sun-500",
  "from-signal-400 to-signal-600",
];

function LessonCard({ lesson, accent }: { lesson: LessonSummary; accent: string }) {
  return (
    <Link
      href={`/amasomo/${lesson.slug}`}
      className={cn(
        "card group relative flex h-full flex-col overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift",
        lesson.completed && "ring-2 ring-brand-400/50",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-soft transition group-hover:scale-105",
            accent,
          )}
        >
          <DynamicIcon name={lesson.icon} className="size-7" />
        </span>
        <span className="font-display text-4xl font-extrabold text-surface-2 transition group-hover:text-brand-100 dark:group-hover:text-brand-500/30">
          {String(lesson.order).padStart(2, "0")}
        </span>
      </div>
      <h2 className="mt-5 text-xl font-bold leading-snug">{lesson.title}</h2>
      <p className="mt-2 line-clamp-3 flex-1 leading-relaxed text-muted">{lesson.summary}</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-sm font-medium text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4" /> {plural(lesson.minutes, "umunota", "iminota")}
        </span>
        {!lesson.after_theory && (
          <span className="inline-flex items-center gap-1.5">
            <Target className="size-4" /> {plural(lesson.question_count, "ikibazo", "ibibazo")}
          </span>
        )}
        {lesson.completed && (
          <span className="ml-auto inline-flex items-center gap-1.5 font-bold text-brand-600 dark:text-brand-300">
            <CircleCheck className="size-4" /> Wararirangije
          </span>
        )}
        {lesson.locked && (
          <span className="ml-auto inline-flex items-center gap-1.5 font-bold text-sun-600">
            <Lock className="size-4" /> Rikeneye ifatabuguzi
          </span>
        )}
      </div>
    </Link>
  );
}

async function LessonGrid() {
  const [all, user] = await Promise.all([serverFetch<LessonSummary[]>("/lessons"), getSessionUser()]);
  // The practical-test guide and the like come after the theory exam: listed apart, not counted in progress.
  const lessons = all.filter((l) => !l.after_theory);
  const later = all.filter((l) => l.after_theory);
  const done = lessons.filter((l) => l.completed).length;
  return (
    <>
      {user && (
        <div className="card mb-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="shrink-0">
            <p className="text-sm font-semibold text-muted">Amasomo warangije</p>
            <p className="font-display text-3xl font-extrabold">
              {done}
              <span className="text-lg text-muted">/{lessons.length}</span>
            </p>
          </div>
          <ProgressBar value={done} max={lessons.length} className="h-3" label="Amasomo warangije" />
        </div>
      )}
      <ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {lessons.map((lesson, i) => (
          <li key={lesson.slug}>
            <LessonCard lesson={lesson} accent={ACCENTS[i % ACCENTS.length]} />
          </li>
        ))}
      </ol>
      {later.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Nyuma yo gutsinda ikizamini cy’amategeko</h2>
          <p className="mt-2 max-w-2xl leading-relaxed text-muted">
            Ikizamini cyo gutwara, ibisabwa n’uko wakitegura. Ntibibarwa mu masomo ugomba kurangiza mbere y’ikizamini
            cy’amategeko.
          </p>
          <ol className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {later.map((lesson) => (
              <li key={lesson.slug}>
                <LessonCard lesson={lesson} accent="from-asphalt to-[#2a3446]" />
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}

function LessonGridSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }, (_, i) => (
        <Skeleton key={i} className="h-64 rounded-3xl" />
      ))}
    </div>
  );
}

export default function LessonsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Amasomo"
        title="Amategeko y’umuhanda, isomo ku rindi"
        description="Amasomo yanditse mu Kinyarwanda cyoroshye, ashingiye ku Iteka rya Perezida rigenga umuhanda no ku Itegeko n° 014/2026. Buri somo rirangirana n’ibyo kwibuka n’ibibazo byo kwitoza."
      />
      <div className="container-page py-12">
        <Suspense fallback={<LessonGridSkeleton />}>
          <LessonGrid />
        </Suspense>
      </div>
    </>
  );
}
