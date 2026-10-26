/* eslint-disable @next/next/no-img-element -- question scans are pre-optimised WebP served by the API */
import { BadgeCheck, ChevronLeft, ChevronRight, CircleAlert, PencilLine, Scale } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ApproveExplanationButton, ExplanationEditor } from "@/components/admin/explanation-editor";
import { QuestionsControls } from "@/components/admin/questions-controls";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { adminFetch } from "@/lib/api-server";
import { formatPercent, timeAgo } from "@/lib/format";
import type { AdminQuestions, Topic } from "@/lib/types";

export const metadata: Metadata = { title: "Ibisobanuro" };

const PAGE_SIZE = 20;
const LETTERS = ["a", "b", "c", "d"];

async function Controls() {
  const topics = await adminFetch<Topic[]>("/topics");
  return <QuestionsControls topics={topics} />;
}

async function QuestionList({ searchParams }: { searchParams: PageProps<"/admin/ibisobanuro">["searchParams"] }) {
  const params = await searchParams;
  const get = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);
  const page = Math.max(1, Number(get("page")) || 1);
  const query = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
  for (const [key, apiKey] of [
    ["q", "search"],
    ["topic", "topic"],
    ["status", "status"],
    ["sort", "sort"],
  ] as const) {
    const value = get(key);
    if (value) query.set(apiKey, value);
  }
  const [data, topics] = await Promise.all([
    adminFetch<AdminQuestions>(`/admin/questions?${query.toString()}`),
    adminFetch<Topic[]>("/topics"),
  ]);
  const topicName = (id: string) => topics.find((t) => t.id === id)?.name ?? id;
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const link = (p: number) => {
    const next = new URLSearchParams(Object.entries(params).filter(([, v]) => typeof v === "string") as [string, string][]);
    next.set("page", String(p));
    return `/admin/ibisobanuro?${next.toString()}`;
  };
  const { counts } = data;

  return (
    <>
      <section className="card mb-6 grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
        <div>
          <div className="flex items-baseline justify-between gap-3 text-sm font-semibold">
            <span>Ibisobanuro byasuzumwe</span>
            <span className="tabular-nums text-muted">
              {counts.reviewed}/{counts.total}
            </span>
          </div>
          <ProgressBar value={counts.reviewed} max={counts.total} className="mt-2" label="Ibisobanuro byasuzumwe" />
          <p className="mt-2 text-xs text-muted">
            Ibisobanuro {counts.with_explanation} biriho · {counts.edited} byahinduwe n’ubuyobozi. Ibitarasuzumwa
            byanditswe hashingiwe ku mategeko; suzuma buri kimwe mbere yo kucyemeza.
          </p>
        </div>
      </section>

      <p className="mb-3 text-sm text-muted">
        {data.total === 0 ? "Nta kibazo kibonetse." : `Ibibazo ${data.total} · urupapuro ${page}/${pages}`}
      </p>
      <ul className="space-y-4">
        {data.items.map((q) => {
          const answer = q.options[q.answer];
          return (
            <li key={q.id} className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-asphalt px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-asphalt">
                  Ikibazo {q.ref}
                </span>
                <Badge>{topicName(q.topic)}</Badge>
                {q.reviewed ? (
                  <Badge tone="brand">
                    <BadgeCheck className="size-3.5" aria-hidden /> Cyasuzumwe
                  </Badge>
                ) : q.explanation ? (
                  <Badge tone="sun">Ntikirasuzumwa</Badge>
                ) : (
                  <Badge tone="signal">
                    <CircleAlert className="size-3.5" aria-hidden /> Nta gisobanuro
                  </Badge>
                )}
                {q.edited && (
                  <Badge tone="ocean">
                    <PencilLine className="size-3.5" aria-hidden /> Cyahinduwe
                  </Badge>
                )}
                <span className="ml-auto text-xs font-semibold tabular-nums text-muted">
                  {q.answered > 0 ? `Ukuri ${formatPercent(q.accuracy)} · ibisubizo ${q.answered}` : "Ntikirasubizwa"}
                </span>
              </div>

              <div className="mt-4 flex gap-4">
                {q.image && (
                  <span className="paper hidden size-24 shrink-0 place-items-center p-1.5 sm:grid">
                    <img src={q.image} alt="" className="max-h-20 max-w-20 object-contain" loading="lazy" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug">{q.text}</p>
                  <p className="mt-1.5 text-sm text-brand-700 dark:text-brand-300">
                    Igisubizo: {LETTERS[q.answer]}) {answer?.text || "(ishusho)"}
                  </p>
                </div>
              </div>

              {q.explanation ? (
                <div className="mt-4 rounded-2xl border border-ocean-200/80 bg-ocean-50/60 p-4 dark:border-ocean-400/20 dark:bg-ocean-500/10">
                  <p className="leading-relaxed text-ink-soft">{q.explanation}</p>
                  {q.law_ref && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-muted">
                      <Scale className="size-3.5 shrink-0" aria-hidden /> {q.law_ref}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl bg-signal-50 p-4 text-sm text-signal-700 dark:bg-signal-500/10 dark:text-signal-200">
                  Abanyeshuri ntibabona igisobanuro kuri iki kibazo.
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted">
                  {q.updated_at ? `Cyahinduwe ${timeAgo(q.updated_at)}${q.updated_by ? ` na ${q.updated_by}` : ""}` : "Igisobanuro cy’ibanze"}
                </span>
                <span className="flex gap-2">
                  <ApproveExplanationButton question={q} />
                  <ExplanationEditor question={q} />
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      {pages > 1 && (
        <nav aria-label="Impapuro" className="mt-6 flex items-center justify-between">
          {page > 1 ? (
            <Link href={link(page - 1)} className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold">
              <ChevronLeft className="size-4" /> Ibibanza
            </Link>
          ) : (
            <span />
          )}
          {page < pages && (
            <Link href={link(page + 1)} className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold">
              Ibikurikira <ChevronRight className="size-4" />
            </Link>
          )}
        </nav>
      )}
    </>
  );
}

export default function AdminExplanationsPage({ searchParams }: PageProps<"/admin/ibisobanuro">) {
  return (
    <div className="px-4 py-8 sm:px-8 lg:py-10">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">Ubuyobozi</p>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Ibisobanuro by’ibibazo</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Impamvu buri gisubizo ari cyo, n’ingingo y’itegeko bishingiyeho. Abanyeshuri babibona nyuma yo gusubiza mu
          myitozo, mu isubiramo no mu isuzuma ry’ibizamini.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-28 rounded-xl" />}>
        <Controls />
      </Suspense>
      <div className="mt-6">
        <Suspense fallback={<Skeleton className="h-[32rem] rounded-3xl" />}>
          <QuestionList searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
