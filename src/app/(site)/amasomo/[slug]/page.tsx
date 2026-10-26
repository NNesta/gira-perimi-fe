import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, Clock, FileText, Lock, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { LessonBlocks } from "@/components/lessons/lesson-blocks";
import { LessonCompleteButton } from "@/components/lessons/lesson-complete-button";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser, serverFetch, ServerApiError } from "@/lib/api-server";
import { plural } from "@/lib/format";
import { DynamicIcon } from "@/lib/icons";
import type { Lesson } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/amasomo/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  try {
    const lesson = await serverFetch<Lesson>(`/lessons/${slug}`);
    return { title: lesson.title, description: lesson.summary };
  } catch {
    return { title: "Isomo" };
  }
}

function Paywall({ slug }: { slug: string }) {
  return (
    <div className="container-page py-20">
      <div className="card mx-auto max-w-xl p-10 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-sun-100 text-sun-700">
          <Lock className="size-7" />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold">Iri somo risaba ifatabuguzi</h1>
        <p className="mt-3 text-muted">Iyandikishe ku ifatabuguzi kugira ngo ubone amasomo yose n’ibizamini by’igerageza.</p>
        <ButtonLink href={`/injira?next=/amasomo/${slug}`} className="mt-8">
          Injira
        </ButtonLink>
      </div>
    </div>
  );
}

async function LessonContent({ params }: { params: PageProps<"/amasomo/[slug]">["params"] }) {
  const { slug } = await params;
  let lesson: Lesson;
  try {
    lesson = await serverFetch<Lesson>(`/lessons/${slug}`);
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) notFound();
    if (error instanceof ServerApiError && error.status === 402) return <Paywall slug={slug} />;
    throw error;
  }
  const user = await getSessionUser();
  const practiceTopic = lesson.topics[0];

  return (
    <article>
      <header className="relative overflow-hidden border-b border-line bg-surface">
        <div aria-hidden className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div aria-hidden className="absolute -right-20 -top-28 size-80 rounded-full bg-gradient-to-br from-brand-300/40 to-ocean-300/30 blur-3xl" />
        <div className="container-page relative py-10 sm:py-14">
          <nav aria-label="Inzira" className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-muted">
            <Link href="/amasomo" className="hover:text-brand-600">
              Amasomo
            </Link>
            <ChevronRight className="size-4" />
            <span className="text-ink">Isomo rya {lesson.order}</span>
          </nav>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            <span className="grid size-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-ocean-600 text-white shadow-lift">
              <DynamicIcon name={lesson.icon} className="size-8" />
            </span>
            <div>
              <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-[2.6rem]">{lesson.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{lesson.summary}</p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" /> {plural(lesson.minutes, "umunota", "iminota")} byo gusoma
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Target className="size-4" /> {plural(lesson.question_count, "ikibazo", "ibibazo")} byo kwitoza
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-page grid gap-12 py-10 lg:py-14 xl:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-muted">
              <BookOpen className="size-4" /> Ibice by’isomo
            </p>
            <ol className="mt-4 space-y-1 border-l-2 border-line">
              {lesson.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="-ml-0.5 block border-l-2 border-transparent py-1.5 pl-4 text-sm font-medium text-muted transition hover:border-brand-400 hover:text-ink"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <div className="min-w-0 max-w-3xl">
          {lesson.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 border-b border-line py-8 first:pt-0 last:border-none">
              <h2 className="mb-5 text-2xl font-extrabold sm:text-[1.7rem]">{section.title}</h2>
              <LessonBlocks blocks={section.blocks} />
            </section>
          ))}

          <div className="mt-6 rounded-[2rem] border border-line bg-surface-2/60 p-6 sm:p-8">
            <p className="font-display text-xl font-bold">Urangije gusoma?</p>
            <p className="mt-2 text-muted">Bika aho ugeze, hanyuma usubize ibibazo by’ikizamini bijyanye n’iri somo.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <LessonCompleteButton slug={lesson.slug} completed={lesson.completed} signedIn={!!user} />
              {practiceTopic && lesson.question_count > 0 && (
                <ButtonLink href={`/imyitozo/kwitoza?topic=${practiceTopic}&count=10`} variant="secondary" size="lg">
                  <Target className="size-5" /> Witoze ibibazo 10
                </ButtonLink>
              )}
            </div>
          </div>

          <nav aria-label="Andi masomo" className="mt-8 grid gap-4 sm:grid-cols-2">
            {lesson.previous ? (
              <Link href={`/amasomo/${lesson.previous.slug}`} className="card group p-5 transition hover:shadow-lift">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-muted">
                  <ArrowLeft className="size-4 transition group-hover:-translate-x-1" /> Isomo ribanza
                </span>
                <span className="mt-1 block font-bold leading-snug">{lesson.previous.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {lesson.next && (
              <Link href={`/amasomo/${lesson.next.slug}`} className="card group p-5 text-right transition hover:shadow-lift">
                <span className="flex items-center justify-end gap-1.5 text-sm font-semibold text-muted">
                  Isomo rikurikira <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
                <span className="mt-1 block font-bold leading-snug">{lesson.next.title}</span>
              </Link>
            )}
          </nav>

          {lesson.sources.length > 0 && (
            <div className="mt-10 text-sm text-muted">
              <p className="flex items-center gap-2 font-bold text-ink-soft">
                <FileText className="size-4" /> Inkomoko
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {lesson.sources.map((source) => (
                  <li key={source}>{source}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function LessonSkeleton() {
  return (
    <div>
      <div className="border-b border-line bg-surface">
        <div className="container-page space-y-4 py-14">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-12 w-3/4 max-w-2xl" />
          <Skeleton className="h-5 w-1/2 max-w-xl" />
        </div>
      </div>
      <div className="container-page max-w-3xl space-y-4 py-12">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-5" />
        ))}
      </div>
    </div>
  );
}

export default function LessonPage({ params }: PageProps<"/amasomo/[slug]">) {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonContent params={params} />
    </Suspense>
  );
}
