"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CloudCheck,
  Flag,
  Grid3x3,
  LoaderCircle,
  RotateCcw,
  TimerReset,
  TriangleAlert,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { LogoMark } from "@/components/brand/logo";
import { optionStates, QuestionView } from "@/components/quiz/question-view";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { api, ApiError, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { Exam } from "@/lib/types";

const LETTERS = ["a", "b", "c", "d"];
// Choices that could not be saved are sent again this long after the last attempt (and as soon as the connection
// comes back).
const RETRY_MS = 4000;

function clock(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function Navigator({
  answers,
  unsaved,
  current,
  onJump,
}: {
  answers: (number | null)[];
  unsaved: boolean[];
  current: number;
  onJump: (index: number) => void;
}) {
  const answered = answers.filter((a) => a !== null).length;
  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {answers.map((answer, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onJump(i)}
            aria-label={`Ikibazo ${i + 1}${answer === null ? "" : unsaved[i] ? ", cyasubijwe ariko ntikibitswe" : ", cyasubijwe"}`}
            aria-current={i === current ? "step" : undefined}
            className={cn(
              "relative grid aspect-square place-items-center rounded-xl text-sm font-bold transition",
              answer === null
                ? "bg-surface-2 text-ink-soft hover:bg-line"
                : unsaved[i]
                  ? "bg-sun-300 text-asphalt hover:bg-sun-400"
                  : "bg-brand-500 text-white hover:bg-brand-600",
              i === current && "ring-2 ring-ocean-500 ring-offset-2 ring-offset-surface",
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm font-semibold text-muted">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-brand-500" /> Wasubije {answered}
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-surface-2 ring-1 ring-line" /> Usigaje {answers.length - answered}
        </span>
      </div>
    </div>
  );
}

export function ExamRunner({ exam }: { exam: Exam }) {
  const router = useRouter();
  const deadline = new Date(exam.deadline_at).getTime();
  const [answers, setAnswers] = useState<(number | null)[]>(() => exam.items.map((item) => item.selected));
  const [current, setCurrent] = useState(() => Math.max(0, exam.items.findIndex((item) => item.selected === null)));
  // First render uses server times only, so SSR and hydration agree; the interval then follows the clock.
  const [remaining, setRemaining] = useState(() => deadline - new Date(exam.server_time).getTime());
  const [saving, setSaving] = useState(0);
  // Positions whose latest choice has not reached the server (poor connection). They are sent again until they do,
  // and in any case with the answer sheet when the exam is handed in.
  const [unsaved, setUnsaved] = useState<ReadonlySet<number>>(() => new Set());
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const queues = useRef(new Map<number, Promise<unknown>>());
  const answersRef = useRef(answers);
  const submittedRef = useRef(false);
  const timeUpRef = useRef(false);

  const submit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    setConfirmOpen(false);
    setNavOpen(false);
    // The whole answer sheet goes along, so choices whose own save failed are graded too.
    const sheet = exam.items.flatMap((item, i) => {
      const selected = answersRef.current[i];
      return selected === null ? [] : [{ position: item.position, selected }];
    });
    try {
      await api(`/exams/${exam.id}/submit`, { method: "POST", json: { answers: sheet } });
    } catch (e) {
      // Nothing was graded: stay on the paper so the learner can hand it in again.
      submittedRef.current = false;
      setSubmitting(false);
      setSubmitError(errorMessage(e));
      return;
    }
    router.refresh();
  }, [exam.id, exam.items, router]);

  useEffect(() => {
    const offset = new Date(exam.server_time).getTime() - Date.now();
    const tick = () => {
      const left = deadline - (Date.now() + offset);
      setRemaining(left);
      // Hand the paper in once when time is up; if that fails, the time-up screen below offers to try again.
      if (left <= 0 && !timeUpRef.current) {
        timeUpRef.current = true;
        void submit();
      }
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [deadline, exam.server_time, submit]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!submittedRef.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const flagUnsaved = useCallback((position: number, pending: boolean) => {
    setUnsaved((prev) => {
      if (prev.has(position) === pending) return prev;
      const next = new Set(prev);
      if (pending) next.add(position);
      else next.delete(position);
      return next;
    });
  }, []);

  const save = useCallback(
    (position: number, choice: number) => {
      setSaving((n) => n + 1);
      // Saves for the same question run one after another, so the last choice always wins.
      const previous = queues.current.get(position) ?? Promise.resolve();
      const request = previous
        .catch(() => undefined)
        .then(() => api(`/exams/${exam.id}/answers/${position}`, { method: "PUT", json: { selected: choice } }))
        .then(() => flagUnsaved(position, false))
        .catch((e) => {
          if (e instanceof ApiError && e.status === 409) {
            // The server has closed the exam (time is up): show the graded result.
            submittedRef.current = true;
            router.refresh();
          } else {
            flagUnsaved(position, true);
            setSaveError(errorMessage(e));
          }
        })
        .finally(() => setSaving((n) => n - 1));
      queues.current.set(position, request);
    },
    [exam.id, flagUnsaved, router],
  );

  const select = useCallback(
    (choice: number) => {
      if (submittedRef.current) return;
      const index = current;
      const next = answersRef.current.map((value, i) => (i === index ? choice : value));
      answersRef.current = next;
      setAnswers(next);
      save(exam.items[index].position, choice);
    },
    [current, exam.items, save],
  );

  const resend = useCallback(() => {
    if (submittedRef.current) return;
    exam.items.forEach((item, i) => {
      const choice = answersRef.current[i];
      if (choice !== null && unsaved.has(item.position)) save(item.position, choice);
    });
  }, [exam.items, save, unsaved]);

  useEffect(() => {
    if (unsaved.size === 0 || saving > 0) return;
    const timer = window.setTimeout(resend, RETRY_MS);
    window.addEventListener("online", resend);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", resend);
    };
  }, [unsaved, saving, resend]);

  const timeUpFailed = remaining <= 0 && submitError !== null && !submitting;

  useEffect(() => {
    if (!timeUpFailed) return;
    const retry = () => void submit();
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, [timeUpFailed, submit]);

  const go = useCallback(
    (index: number) => {
      setCurrent(Math.min(exam.items.length - 1, Math.max(0, index)));
      setNavOpen(false);
    },
    [exam.items.length],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (confirmOpen || event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      const n = ["1", "2", "3", "4"].includes(key) ? Number(key) - 1 : LETTERS.indexOf(key);
      if (n >= 0 && n < exam.items[current].options.length) select(n);
      if (key === "arrowright") go(current + 1);
      if (key === "arrowleft") go(current - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen, current, exam.items, go, select]);

  const item = exam.items[current];
  const answeredCount = answers.filter((a) => a !== null).length;
  const unanswered = answers.length - answeredCount;
  const unsavedFlags = exam.items.map((entry) => unsaved.has(entry.position));
  const urgent = remaining <= 2 * 60 * 1000;
  const warning = remaining <= 5 * 60 * 1000;
  const totalMs = deadline - new Date(exam.started_at).getTime();

  if (submitting) {
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <div className="text-center">
          <LoaderCircle className="mx-auto size-12 animate-spin text-brand-500" />
          <p className="mt-5 font-display text-2xl font-extrabold">Turimo kubara amanota yawe...</p>
          <p className="mt-2 text-muted">Tegereza gato.</p>
        </div>
      </div>
    );
  }

  if (timeUpFailed) {
    return (
      <div className="grid min-h-dvh place-items-center p-6">
        <div role="alert" className="max-w-md text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-signal-50 text-signal-600 dark:bg-signal-500/10">
            <TriangleAlert className="size-7" />
          </span>
          <p className="mt-5 font-display text-2xl font-extrabold">Igihe cyarangiye</p>
          <p className="mt-2 text-muted">
            Ntitwashoboye kohereza ikizamini: {submitError} Ibisubizo byabitswe ntibizatakara.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => void submit()}>
              <RotateCcw className="size-4" /> Ongera ugerageze
            </Button>
            <ButtonLink href="/ikibaho" variant="secondary">
              Subira ku kibaho
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh pb-28 lg:pb-12">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center gap-3 sm:gap-5">
          <Link href="/ikizamini" aria-label="Va mu kizamini" className="shrink-0 rounded-xl">
            <LogoMark className="size-9" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>
                Ikibazo {current + 1}
                <span className="text-muted">/{exam.items.length}</span>
              </span>
              <span className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
                {saving > 0 ? (
                  <>
                    <LoaderCircle className="size-3.5 animate-spin" /> Birabikwa...
                  </>
                ) : unsaved.size > 0 ? (
                  <>
                    <TriangleAlert className="size-3.5 text-sun-600" /> Ntibibitswe
                  </>
                ) : (
                  <>
                    <CloudCheck className="size-3.5 text-brand-500" /> Byabitswe
                  </>
                )}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-500"
                style={{ width: `${(answeredCount / exam.items.length) * 100}%` }}
              />
            </div>
          </div>
          <div
            role="timer"
            aria-label="Igihe gisigaye"
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 font-display text-lg font-extrabold tabular-nums transition-colors sm:px-4",
              urgent
                ? "animate-pulse bg-signal-500 text-white"
                : warning
                  ? "bg-sun-300 text-asphalt"
                  : "bg-asphalt text-white dark:bg-white dark:text-asphalt",
            )}
          >
            <TimerReset className="size-5" />
            {clock(remaining)}
          </div>
          <Button size="sm" variant="secondary" className="hidden sm:inline-flex" onClick={() => setConfirmOpen(true)}>
            <Flag className="size-4" /> Soza
          </Button>
        </div>
        <div className="h-0.5 bg-surface-2">
          <div
            className={cn("h-full transition-[width] duration-300", urgent ? "bg-signal-500" : "bg-ocean-400")}
            style={{ width: `${Math.max(0, Math.min(1, remaining / totalMs)) * 100}%` }}
          />
        </div>
      </header>

      <div className="container-page grid gap-6 py-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="card p-5 sm:p-8">
          {submitError && (
            <div
              role="alert"
              className="mb-6 flex flex-col gap-3 rounded-xl bg-signal-50 px-4 py-3 text-sm font-medium text-signal-700 sm:flex-row sm:items-center sm:justify-between dark:bg-signal-500/10 dark:text-signal-200"
            >
              <p className="flex items-center gap-2">
                <TriangleAlert className="size-4 shrink-0" /> Ikizamini ntikoherejwe: {submitError}
              </p>
              <Button size="sm" variant="secondary" className="shrink-0" onClick={() => void submit()}>
                <RotateCcw className="size-4" /> Ongera ugerageze
              </Button>
            </div>
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={item.position}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
            >
              <QuestionView
                number={current + 1}
                total={exam.items.length}
                text={item.text}
                image={item.image}
                options={item.options}
                states={optionStates(item.options.length, answers[current], null)}
                onSelect={select}
              />
            </motion.div>
          </AnimatePresence>
          {unsaved.size > 0 && (
            <p role="status" className="mt-4 flex items-start gap-2 rounded-xl bg-sun-50 px-4 py-3 text-sm font-medium text-sun-800 dark:bg-sun-400/10 dark:text-sun-200">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                {unsaved.size === 1 ? "Igisubizo 1 ntikibitswe" : `Ibisubizo ${unsaved.size} ntibibitswe`}
                {saveError ? `: ${saveError}` : "."} Turongera kubyohereza mu kanya, kandi bizajyana n’ikizamini nusoza.
              </span>
            </p>
          )}
          <div className="mt-8 hidden items-center justify-between gap-3 lg:flex">
            <Button variant="secondary" onClick={() => go(current - 1)} disabled={current === 0}>
              <ArrowLeft className="size-4" /> Ikibanza
            </Button>
            {current + 1 < exam.items.length ? (
              <Button onClick={() => go(current + 1)}>
                Igikurikira <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button variant="dark" onClick={() => setConfirmOpen(true)}>
                <Flag className="size-4" /> Soza ikizamini
              </Button>
            )}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="card sticky top-24 p-5">
            <p className="mb-4 font-bold">Ibibazo byose</p>
            <Navigator answers={answers} unsaved={unsavedFlags} current={current} onJump={go} />
            <Button variant="dark" className="mt-5 w-full" onClick={() => setConfirmOpen(true)}>
              <Flag className="size-4" /> Soza ikizamini
            </Button>
            <p className="mt-4 text-center text-xs text-muted">Utubuto 1–4 cyangwa a–d · ← →</p>
          </div>
        </aside>
      </div>

      {/* phone controls */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="container-page flex items-center gap-2 py-3">
          <Button variant="secondary" size="md" aria-label="Ikibanza" onClick={() => go(current - 1)} disabled={current === 0} className="px-3.5">
            <ArrowLeft className="size-5" />
          </Button>
          <Button variant="secondary" size="md" onClick={() => setNavOpen(true)} className="flex-1">
            <Grid3x3 className="size-4" /> {answeredCount}/{exam.items.length}
          </Button>
          {current + 1 < exam.items.length ? (
            <Button size="md" onClick={() => go(current + 1)} className="flex-1">
              Igikurikira <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button size="md" variant="dark" onClick={() => setConfirmOpen(true)} className="flex-1">
              <Flag className="size-4" /> Soza
            </Button>
          )}
        </div>
      </div>

      <Dialog open={navOpen} onClose={() => setNavOpen(false)} title="Ibibazo byose" size="sm">
        <Navigator answers={answers} unsaved={unsavedFlags} current={current} onJump={go} />
        <Button variant="dark" className="mt-6 w-full" onClick={() => setConfirmOpen(true)}>
          <Flag className="size-4" /> Soza ikizamini
        </Button>
      </Dialog>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Urashaka gusoza ikizamini?"
        description={
          <span>
            {unanswered > 0 ? (
              <>
                Usigaje <strong className="text-signal-600">ibibazo {unanswered}</strong> utasubije. Ibibazo bidasubijwe
                bibarwa nk’ibisubizo bitari byo.
              </>
            ) : (
              "Wasubije ibibazo byose. Nusoza, uzahita ubona amanota yawe n’ibisubizo by’ukuri."
            )}
            {unsaved.size > 0 && " Ibisubizo bitarabikwa bizoherezwa hamwe n’ikizamini."}
          </span>
        }
        size="sm"
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Garuka ku kizamini
          </Button>
          <Button onClick={() => void submit()}>
            <Check className="size-4" /> Yego, soza
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
