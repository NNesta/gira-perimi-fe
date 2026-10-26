"use client";

import confetti from "canvas-confetti";
import { CircleCheck, CircleHelp, CircleX, Clock, ExternalLink, LayoutDashboard, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LogoMark } from "@/components/brand/logo";
import { ThemeMenu } from "@/components/theme/theme-toggle";
import { ExamStartButton } from "@/components/exam/exam-start-button";
import { optionStates, QuestionView } from "@/components/quiz/question-view";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { cn } from "@/lib/cn";
import { formatDateTime, formatDuration, formatScore } from "@/lib/format";
import type { Exam, Readiness, Topic } from "@/lib/types";

type Filter = "byose" | "nabi" | "neza" | "ntasubije";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "byose", label: "Byose" },
  { id: "nabi", label: "Ibyo nibeshye" },
  { id: "neza", label: "Ibyo nakoze neza" },
  { id: "ntasubije", label: "Ibyo ntasubije" },
];

function celebrate() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#00a1de", "#fad201", "#20603d", "#129b68"];
  const end = Date.now() + 1400;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function ExamResult({ exam, readiness, topics }: { exam: Exam; readiness: Readiness; topics: Topic[] }) {
  const [filter, setFilter] = useState<Filter>("byose");
  const score = exam.score ?? 0;
  const passed = !!exam.passed;
  const wrong = exam.items.filter((i) => i.selected !== null && !i.is_correct).length;
  const skipped = exam.items.filter((i) => i.selected === null).length;
  const duration =
    exam.submitted_at !== null
      ? Math.round((new Date(exam.submitted_at).getTime() - new Date(exam.started_at).getTime()) / 1000)
      : null;
  const topicName = (id: string) => topics.find((t) => t.id === id)?.name ?? id;

  useEffect(() => {
    if (!passed) return;
    const key = `gp-celebrated-${exam.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // storage unavailable: celebrate anyway
    }
    celebrate();
  }, [exam.id, passed]);

  const items = useMemo(
    () =>
      exam.items.filter((item) => {
        if (filter === "nabi") return item.selected !== null && !item.is_correct;
        if (filter === "neza") return !!item.is_correct;
        if (filter === "ntasubije") return item.selected === null;
        return true;
      }),
    [exam.items, filter],
  );

  return (
    <div className="min-h-dvh pb-16">
      <header className="border-b border-line bg-surface/90 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" aria-label="Ahabanza">
            <LogoMark className="size-9" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeMenu />
            <ButtonLink href="/ikibaho" variant="secondary" size="sm">
              <LayoutDashboard className="size-4" /> Ikibaho cyanjye
            </ButtonLink>
          </div>
        </div>
      </header>

      <div className="container-page py-8 sm:py-12">
        <section
          className={cn(
            "relative overflow-hidden rounded-[2.5rem] p-7 text-white shadow-lift sm:p-12",
            passed ? "bg-gradient-to-br from-brand-500 via-brand-600 to-ocean-700" : "bg-gradient-to-br from-asphalt via-[#2a3446] to-signal-700",
          )}
        >
          <div aria-hidden className="bg-grid absolute inset-0 opacity-15" />
          <div className="relative grid items-center gap-10 md:grid-cols-[auto_1fr]">
            <ProgressRing
              value={score}
              max={exam.total}
              size={190}
              stroke={14}
              trackClassName="stroke-white/20"
              barClassName={passed ? "stroke-sun-300" : "stroke-signal-200"}
              className="mx-auto"
              label="Amanota"
            >
              <span>
                <span className="block font-display text-6xl font-extrabold">{score}</span>
                <span className="text-sm font-semibold text-white/80">kuri {exam.total}</span>
              </span>
            </ProgressRing>
            <div className="text-center md:text-left">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
                {passed ? <Trophy className="size-4 text-sun-300" /> : <RotateCcw className="size-4" />}
                {passed ? "Watsinze ikizamini!" : "Ntiwatsinze iki gihe"}
              </p>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
                {passed
                  ? score >= 18
                    ? "Ni intsinzi ikomeye! 🎉"
                    : "Wabishoboye! Komereza aho."
                  : "Ntucike intege, uri mu nzira nziza."}
              </h1>
              <p className="mt-3 max-w-xl text-white/85">
                {passed
                  ? `Wabonye ${score}/${exam.total}. Amanota yo gutsinda ni ${exam.pass_mark}/${exam.total}.`
                  : `Wabonye ${score}/${exam.total}; wari ukeneye nibura ${exam.pass_mark}. Subira ku byo wibeshye maze wongere ugerageze.`}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-white/85 md:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <CircleCheck className="size-4" /> Ukuri: {score}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CircleX className="size-4" /> Nabi: {wrong}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CircleHelp className="size-4" /> Ntiwasubije: {skipped}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" /> Igihe: {formatDuration(duration)}
                </span>
              </div>
              {exam.auto_submitted && (
                <p className="mt-4 text-sm text-white/75">Igihe cyararangiye: ikizamini cyasojwe ubwacyo n’ibisubizo wari umaze gutanga.</p>
              )}
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <section className="card p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted">Aho ugeze ugana ku kizamini nyirizina</p>
            {readiness.ready ? (
              <div className="mt-4">
                <p className="font-display text-2xl font-extrabold text-brand-600 dark:text-brand-300">Witeguye gukora ikizamini! 🚦</p>
                <p className="mt-2 text-muted">
                  Umaze gukora ibizamini {readiness.exams_completed} ufite impuzandengo ya {formatScore(readiness.average)}/20.
                  Iyandikishe ku kizamini cy’uruhushya rw’agateganyo.
                </p>
                <a
                  href="https://irembo.gov.rw"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 font-bold text-brand-600 hover:underline dark:text-brand-300"
                >
                  Iyandikishe kuri Irembo <ExternalLink className="size-4" />
                </a>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Ibizamini wakoze</span>
                    <span>
                      {readiness.exams_completed >= readiness.exams_required
                        ? `${readiness.exams_completed} ✓`
                        : `${readiness.exams_completed}/${readiness.exams_required}`}
                    </span>
                  </div>
                  <ProgressBar value={readiness.exams_completed} max={readiness.exams_required} className="mt-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Impuzandengo (igomba kurenga {readiness.average_required})</span>
                    <span>{formatScore(readiness.average)}/20</span>
                  </div>
                  <ProgressBar
                    value={readiness.average ?? 0}
                    max={20}
                    className="mt-2"
                    barClassName={(readiness.average ?? 0) > readiness.average_required ? undefined : "from-sun-300 to-sun-500"}
                  />
                </div>
              </div>
            )}
          </section>
          <section className="card flex flex-col justify-center gap-3 p-6 sm:p-8">
            <ExamStartButton signedIn size="lg" className="w-full" />
            <ButtonLink href="/imyitozo/kwitoza?mode=mistakes&count=20" variant="secondary" size="lg" className="w-full">
              <RotateCcw className="size-5" /> Witoze ibyo wibeshye
            </ButtonLink>
            <p className="text-center text-xs text-muted">Byakozwe {formatDateTime(exam.started_at)}</p>
          </section>
        </div>

        <section className="mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl font-extrabold">Isubiramo ry’ibibazo</h2>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
                    filter === f.id ? "border-asphalt bg-asphalt text-white dark:border-white dark:bg-white dark:text-asphalt" : "border-line bg-surface text-ink-soft",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <ol className="mt-6 space-y-5">
            {items.map((item) => (
              <li key={item.position} className="card relative overflow-hidden p-5 sm:p-7">
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-y-0 left-0 w-1.5",
                    item.is_correct ? "bg-brand-500" : item.selected === null ? "bg-sun-400" : "bg-signal-500",
                  )}
                />
                <QuestionView
                  number={item.position}
                  total={exam.total}
                  text={item.text}
                  image={item.image}
                  options={item.options}
                  states={optionStates(item.options.length, item.selected, item.answer)}
                  disabled
                  topicLabel={topicName(item.topic)}
                />
                {item.selected === null && (
                  <p className="mt-4 text-sm font-semibold text-sun-700 dark:text-sun-300">Iki kibazo ntiwagisubije.</p>
                )}
              </li>
            ))}
          </ol>
          {items.length === 0 && <p className="card p-8 text-center text-muted">Nta kibazo kiri muri iki cyiciro.</p>}
        </section>
      </div>
    </div>
  );
}
