import { ChevronLeft, ChevronRight, CircleCheck, History, PartyPopper, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { QuestionCard } from "@/components/quiz/question-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/section-heading";
import { PageSkeleton } from "@/components/ui/skeleton";
import { learnerFetch } from "@/lib/api-server";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/format";
import type { Mistakes, MistakeStatus, Topic } from "@/lib/types";

export const metadata: Metadata = { title: "Ibyo nibeshyeho", robots: { index: false } };

const PAGE = "/imyitozo/amakosa";
const STATUSES: { id: MistakeStatus; label: string }[] = [
  { id: "all", label: "Byose" },
  { id: "open", label: "Bitarakosorwa" },
  { id: "fixed", label: "Nakosoye" },
];

type Filters = { topic: string | null; status: MistakeStatus; page: number };

function href({ topic, status, page }: Filters): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (topic) params.set("topic", topic);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `${PAGE}?${search}` : PAGE;
}

async function MistakesList({ searchParams }: { searchParams: PageProps<"/imyitozo/amakosa">["searchParams"] }) {
  const params = await searchParams;
  const get = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : null);
  const status = (STATUSES.some((s) => s.id === get("status")) ? get("status") : "all") as MistakeStatus;
  const filters: Filters = { topic: get("topic"), status, page: Math.max(1, Number(get("page")) || 1) };
  const query = new URLSearchParams({ status, page: String(filters.page) });
  if (filters.topic) query.set("topic", filters.topic);

  const [data, topics] = await Promise.all([
    learnerFetch<Mistakes>(`/practice/mistakes?${query.toString()}`, PAGE),
    learnerFetch<Topic[]>("/topics", PAGE),
  ]);
  const topicName = (id: string) => topics.find((t) => t.id === id)?.name ?? id;
  const pages = Math.max(1, Math.ceil(data.total / data.page_size));

  if (data.counts.all === 0) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15">
          <PartyPopper className="size-7" aria-hidden />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold">Nta kosa uragira</h2>
        <p className="mt-3 text-muted">Ibibazo uzasubiza nabi mu myitozo no mu bizamini bizajya biza hano, n’impamvu igisubizo cy’ukuri ari cyo.</p>
        <ButtonLink href="/imyitozo" className="mt-7">
          <Target className="size-4" /> Tangira imyitozo
        </ButtonLink>
      </div>
    );
  }

  const practiceHref = `/imyitozo/kwitoza?mode=mistakes&count=10${filters.topic ? `&topic=${filters.topic}` : ""}`;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Uko bihagaze" className="inline-flex rounded-2xl border border-line bg-surface p-1 shadow-soft">
          {STATUSES.map((s) => (
            <Link
              key={s.id}
              href={href({ ...filters, status: s.id, page: 1 })}
              aria-current={s.id === status ? "page" : undefined}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-semibold transition sm:px-4",
                s.id === status ? "bg-brand-500 text-white" : "text-ink-soft hover:bg-surface-2",
              )}
            >
              {s.label} <span className="tabular-nums opacity-75">{data.counts[s.id]}</span>
            </Link>
          ))}
        </nav>
        {data.counts.open > 0 && (
          <ButtonLink href={practiceHref} variant="soft">
            <History className="size-4" /> Witoze ibyo nibeshyeho
          </ButtonLink>
        )}
      </div>

      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" aria-label="Ibice">
        {[null, ...topics.map((t) => t.id).filter((id) => data.topics[id])].map((id) => (
          <Link
            key={id ?? "all"}
            href={href({ ...filters, topic: id, page: 1 })}
            aria-current={filters.topic === id ? "page" : undefined}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition",
              filters.topic === id ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-surface text-ink-soft hover:border-brand-300",
            )}
          >
            {id ? topicName(id) : "Ibice byose"}
            {id && <span className="tabular-nums opacity-75">{data.topics[id]}</span>}
          </Link>
        ))}
      </div>

      {data.items.length === 0 ? (
        <p className="card mt-6 p-8 text-center text-muted">Nta kibazo kiri muri iki gice.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {data.items.map((m) => (
            <QuestionCard
              key={m.question.id}
              question={m.question}
              topicName={topicName(m.question.topic)}
              picked={m.last_selected}
              badges={
                m.fixed ? (
                  <Badge tone="brand">
                    <CircleCheck className="size-3.5" aria-hidden /> Wabikosoye
                  </Badge>
                ) : (
                  <Badge tone="signal">{m.wrong_count > 1 ? `Wibeshye inshuro ${m.wrong_count}` : "Wibeshye"}</Badge>
                )
              }
              meta={m.last_selected === null ? `Ntiwagisubije · ${timeAgo(m.last_wrong_at)}` : timeAgo(m.last_wrong_at)}
            />
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Impapuro" className="mt-6 flex items-center justify-between">
          {filters.page > 1 ? (
            <Link href={href({ ...filters, page: filters.page - 1 })} className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold">
              <ChevronLeft className="size-4" /> Ibibanza
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted">
            {filters.page}/{pages}
          </span>
          {filters.page < pages ? (
            <Link href={href({ ...filters, page: filters.page + 1 })} className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold">
              Ibikurikira <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}

export default function MistakesPage({ searchParams }: PageProps<"/imyitozo/amakosa">) {
  return (
    <>
      <PageHeader
        eyebrow="Imyitozo"
        title="Ibyo nibeshyeho"
        description="Ibibazo byose wasubije nabi mu myitozo no mu bizamini, icyo wahisemo, igisubizo cy’ukuri n’impamvu yacyo."
      />
      <div className="container-page py-10">
        <Suspense fallback={<PageSkeleton title={false} />}>
          <MistakesList searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
