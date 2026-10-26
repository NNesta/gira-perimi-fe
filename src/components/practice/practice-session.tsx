"use client";

import { ArrowLeft, ArrowRight, BookOpen, CircleCheck, CircleX, History, RotateCcw, Target } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { optionStates, QuestionView } from "@/components/quiz/question-view";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { PracticeMode, PracticeSet, QuestionWithAnswer, Topic } from "@/lib/types";

const LETTERS = ["a", "b", "c", "d"];
const MODE_LABELS: Record<PracticeMode, string> = {
  random: "Bivanze",
  new: "Ibibazo bishya",
  mistakes: "Ibyo nibeshyeho",
};

type Answer = { question: QuestionWithAnswer; selected: number };

export function PracticeSession({
  topic,
  mode,
  count,
  topics,
}: {
  topic: string | null;
  mode: PracticeMode;
  count: number;
  topics: Topic[];
}) {
  const [set, setSet] = useState<PracticeSet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  const topicInfo = topics.find((t) => t.id === topic) ?? null;
  const topicName = (id: string) => topics.find((t) => t.id === id)?.name ?? id;

  const load = useCallback(async () => {
    setSet(null);
    setError(null);
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    try {
      const params = new URLSearchParams({ mode, count: String(count) });
      if (topic) params.set("topic", topic);
      setSet(await api<PracticeSet>(`/practice/questions?${params.toString()}`));
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [topic, mode, count]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading a fresh random set on mount
    void load();
  }, [load]);

  const question = set?.questions[index];
  const finished = !!set && set.questions.length > 0 && index >= set.questions.length;

  const choose = useCallback(
    (choice: number) => {
      if (!question || selected !== null) return;
      setSelected(choice);
      setAnswers((list) => [...list, { question, selected: choice }]);
      api("/practice/answers", { method: "POST", json: { question_id: question.id, selected: choice } }).catch((e) =>
        setSaveError(errorMessage(e)),
      );
    },
    [question, selected],
  );

  const next = useCallback(() => {
    if (selected === null) return;
    setSelected(null);
    setIndex((i) => i + 1);
  }, [selected]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.metaKey || event.ctrlKey) return;
      const key = event.key.toLowerCase();
      const n = ["1", "2", "3", "4"].indexOf(key) >= 0 ? Number(key) - 1 : LETTERS.indexOf(key);
      if (n >= 0 && question && n < question.options.length) choose(n);
      if (key === "enter" || key === "arrowright") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, next, question]);

  const correct = answers.filter((a) => a.selected === a.question.answer).length;

  if (error) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <p className="text-muted">{error}</p>
        <Button className="mt-6" onClick={load}>
          <RotateCcw className="size-4" /> Ongera ugerageze
        </Button>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="card mx-auto max-w-3xl space-y-4 p-8" aria-busy="true">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-8 w-4/5" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (set.questions.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15">
          {mode === "mistakes" ? <CircleCheck className="size-7" /> : <Target className="size-7" />}
        </span>
        <h2 className="mt-5 text-2xl font-extrabold">
          {mode === "mistakes" ? "Nta kibazo wibeshyeho!" : "Nta bibazo bishya bisigaye"}
        </h2>
        <p className="mt-3 text-muted">
          {mode === "mistakes"
            ? "Nta kibazo uheruka gusubiza nabi muri iki gice. Komeza witoze ibindi bibazo."
            : "Wabonye ibibazo byose by’iki gice. Ongera ubyitoze ku buryo buvanze."}
        </p>
        <ButtonLink href={`/imyitozo/kwitoza?mode=random&count=${count}${topic ? `&topic=${topic}` : ""}`} className="mt-7">
          Witoze ku buryo buvanze <ArrowRight className="size-4" />
        </ButtonLink>
      </div>
    );
  }

  if (finished) {
    const total = answers.length;
    const ratio = correct / total;
    const mistakes = answers.filter((a) => a.selected !== a.question.answer);
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden p-8 text-center sm:p-10">
          <ProgressRing value={correct} max={total} size={150} stroke={12} barClassName={ratio >= 0.6 ? "stroke-brand-500" : "stroke-sun-400"} label="Amanota">
            <span>
              <span className="block font-display text-4xl font-extrabold">
                {correct}/{total}
              </span>
              <span className="text-sm font-semibold text-muted">{Math.round(ratio * 100)}%</span>
            </span>
          </ProgressRing>
          <h2 className="mt-6 text-3xl font-extrabold">
            {ratio >= 0.8 ? "Ni byiza cyane!" : ratio >= 0.6 ? "Ugenda neza!" : "Komeza witoze!"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            {ratio >= 0.8
              ? "Uri ku rwego rwiza. Gerageza ikizamini cyuzuye cy’ibibazo 20 mu minota 20."
              : "Subira ku bibazo wibeshyeho, usome isomo bijyanye, hanyuma wongere ugerageze."}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Button onClick={load}>
              <RotateCcw className="size-4" /> Indi myitozo
            </Button>
            {mistakes.length > 0 && (
              <ButtonLink href={`/imyitozo/kwitoza?mode=mistakes&count=${count}${topic ? `&topic=${topic}` : ""}`} variant="secondary">
                <History className="size-4" /> Subiramo ibyo nibeshyeho
              </ButtonLink>
            )}
            <ButtonLink href="/ikizamini" variant="secondary">
              Kora ikizamini <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </motion.div>

        {mistakes.length > 0 && (
          <div className="card p-6 sm:p-8">
            <h3 className="text-xl font-extrabold">Ibyo wibeshyeho ({mistakes.length})</h3>
            <ul className="mt-5 divide-y divide-line">
              {mistakes.map(({ question: q, selected: s }) => (
                <li key={q.id} className="py-4">
                  <p className="font-semibold">{q.text}</p>
                  <p className="mt-2 flex items-start gap-2 text-sm text-signal-600 dark:text-signal-400">
                    <CircleX className="mt-0.5 size-4 shrink-0" /> Wasubije: {LETTERS[s]}) {q.options[s]?.text || "(ishusho)"}
                  </p>
                  <p className="mt-1 flex items-start gap-2 text-sm text-brand-700 dark:text-brand-300">
                    <CircleCheck className="mt-0.5 size-4 shrink-0" /> Igisubizo cy’ukuri: {LETTERS[q.answer]}){" "}
                    {q.options[q.answer]?.text || "(ishusho)"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const answered = selected !== null;
  const isRight = answered && selected === question!.answer;
  const lessonSlug = topics.find((t) => t.id === question!.topic)?.lessons[0];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/imyitozo" aria-label="Subira ku myitozo" className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-muted transition hover:text-ink">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 text-sm font-semibold">
            <span className="truncate">{topicInfo?.name ?? "Ibice byose"} · {MODE_LABELS[mode]}</span>
            <span className="shrink-0 text-muted">
              {index + 1}/{set.questions.length}
            </span>
          </div>
          <ProgressBar value={index + (answered ? 1 : 0)} max={set.questions.length} className="mt-2" label="Aho ugeze" />
        </div>
        <span className="shrink-0 rounded-xl bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          {correct} ✓
        </span>
      </div>

      <div className="card p-5 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={question!.id}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.22 }}
          >
            <QuestionView
              number={index + 1}
              text={question!.text}
              image={question!.image}
              options={question!.options}
              states={optionStates(question!.options.length, selected, answered ? question!.answer : null)}
              onSelect={choose}
              disabled={answered}
              topicLabel={topicName(question!.topic)}
            />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mt-6 flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between",
                isRight ? "bg-brand-50 dark:bg-brand-500/12" : "bg-signal-50 dark:bg-signal-500/10",
              )}
            >
              <div className="flex items-start gap-3">
                {isRight ? (
                  <CircleCheck className="mt-0.5 size-6 shrink-0 text-brand-600" />
                ) : (
                  <CircleX className="mt-0.5 size-6 shrink-0 text-signal-600" />
                )}
                <div>
                  <p className={cn("font-bold", isRight ? "text-brand-700 dark:text-brand-300" : "text-signal-700 dark:text-signal-300")}>
                    {isRight ? "Ni byo! Komereza aho." : `Si byo. Igisubizo cy’ukuri ni (${LETTERS[question!.answer]}).`}
                  </p>
                  {!isRight && lessonSlug && (
                    <Link href={`/amasomo/${lessonSlug}`} className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft underline-offset-4 hover:underline">
                      <BookOpen className="size-4" /> Soma isomo bijyanye
                    </Link>
                  )}
                </div>
              </div>
              <Button onClick={next} className="shrink-0">
                {index + 1 >= set.questions.length ? "Reba uko wakoze" : "Ibikurikira"} <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        {saveError && <p className="mt-3 text-sm text-signal-600">Igisubizo ntikibitswe: {saveError}</p>}
      </div>
      <p className="mt-4 hidden text-center text-xs text-muted sm:block">
        Inama: koresha utubuto 1–4 (cyangwa a–d) gusubiza, na Enter gukomeza.
      </p>
    </div>
  );
}
