"use client";

import { ArrowLeft, ArrowRight, CalendarClock, Check, CircleCheck, CircleX, Layers, Repeat, Target, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Explanation } from "@/components/quiz/explanation";
import { optionStates, QuestionView } from "@/components/quiz/question-view";
import { ReviewBoxes } from "@/components/review/review-boxes";
import { SignFlipCard } from "@/components/signs/sign-flip-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatDate, plural } from "@/lib/format";
import { queueAnswer } from "@/lib/offline";
import type { ReviewSession, ReviewSummary, Topic } from "@/lib/types";

const LETTERS = ["a", "b", "c", "d"];

function Intro({ summary, count, onStart }: { summary: ReviewSummary; count: number; onStart: () => void }) {
  const questions = Math.min(count, summary.due_questions);
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ocean-600 via-ocean-700 to-brand-700 p-7 text-white shadow-lift sm:p-10">
        <div aria-hidden className="bg-grid absolute inset-0 opacity-15" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
            <Repeat className="size-4" aria-hidden /> Isubiramo ry’uyu munsi
          </p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
            Ufite {plural(summary.due, "ikintu", "ibintu")} byo gusubiramo
          </h1>
          <p className="mt-3 max-w-xl text-white/85">
            Ibyo wibeshyeho bigaruka uko iminsi igenda: ejo, nyuma y’iminsi 3, icyumweru, ibyumweru 2, n’ukwezi. Iyo
            wibutse neza, byimukira mu gasanduku gakurikira, kugeza ubimenye burundu.
          </p>
          <p className="mt-4 text-sm font-semibold text-white/80">
            {plural(questions, "ikibazo", "ibibazo")} · {plural(count - questions, "icyapa", "ibyapa")}
          </p>
          <Button variant="sun" size="lg" className="mt-7" onClick={onStart}>
            Tangira gusubiramo <ArrowRight className="size-5" />
          </Button>
        </div>
      </section>
      <section className="card p-5 sm:p-7">
        <h2 className="text-lg font-bold">Udusanduku twawe</h2>
        <p className="mt-1 text-sm text-muted">Ibintu {summary.learning} biracyigwa · {summary.mastered} wabimenye neza.</p>
        <div className="mt-5">
          <ReviewBoxes boxes={summary.boxes} mastered={summary.mastered} />
        </div>
      </section>
    </div>
  );
}

function Empty({ summary }: { summary: ReviewSummary }) {
  const started = summary.learning + summary.mastered > 0;
  return (
    <div className="space-y-6">
      <section className="card p-8 text-center sm:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          {started ? <CircleCheck className="size-8" aria-hidden /> : <Repeat className="size-8" aria-hidden />}
        </span>
        <h1 className="mt-6 text-3xl font-extrabold">
          {started ? "Nta kintu cyo gusubiramo uyu munsi 🎉" : "Isubiramo ritangira nyuma y’imyitozo"}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-muted">
          {started
            ? summary.next_due_at
              ? `Ibikurikira bizagaruka ku itariki ya ${formatDate(summary.next_due_at)}. Hagati aho, komeza witoze.`
              : "Wamenye ibyo wibeshyeho byose. Komeza witoze ibibazo bishya."
            : "Ibibazo wibeshyeho mu myitozo n’ibizamini, n’ibyapa utari uzi mu makarita, bizagaruka hano ku munsi ukwiye."}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/imyitozo">
            <Target className="size-4" aria-hidden /> Witoze
          </ButtonLink>
          <ButtonLink href="/ibyapa" variant="secondary">
            <Layers className="size-4" aria-hidden /> Amakarita y’ibyapa
          </ButtonLink>
        </div>
      </section>
      {started && (
        <section className="card p-5 sm:p-7">
          <h2 className="text-lg font-bold">Udusanduku twawe</h2>
          <div className="mt-5">
            <ReviewBoxes boxes={summary.boxes} mastered={summary.mastered} />
          </div>
        </section>
      )}
    </div>
  );
}

/** Today's spaced review: due questions (with explanations) and due sign flashcards, then a short summary. */
export function ReviewRunner({ session, topics, uid }: { session: ReviewSession; topics: Topic[]; uid: string }) {
  const router = useRouter();
  const { summary, items } = session;
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const item = items[index];
  const finished = started && index >= items.length;
  const topicName = (id: string) => topics.find((t) => t.id === id)?.name ?? id;

  const advance = useCallback(() => {
    setSelected(null);
    setFlipped(false);
    setIndex((i) => i + 1);
  }, []);

  const choose = useCallback(
    (choice: number) => {
      if (item?.kind !== "question" || selected !== null) return;
      const question = item.question;
      setSelected(choice);
      setResults((r) => [...r, choice === question.answer]);
      if (!navigator.onLine) {
        queueAnswer(uid, question.id, choice);
        return;
      }
      api("/practice/answers", { method: "POST", json: { question_id: question.id, selected: choice } }).catch((e) => {
        if (e instanceof TypeError) queueAnswer(uid, question.id, choice);
      });
    },
    [item, selected, uid],
  );

  const recall = useCallback(
    (known: boolean) => {
      if (item?.kind !== "sign") return;
      setResults((r) => [...r, known]);
      api("/review/signs", { method: "POST", json: { sign_id: item.sign.id, known } }).catch(() => undefined);
      advance();
    },
    [item, advance],
  );

  useEffect(() => {
    if (!started || !item) return;
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.target instanceof HTMLInputElement) return;
      const key = event.key.toLowerCase();
      if (item.kind === "question") {
        const n = ["1", "2", "3", "4"].indexOf(key) >= 0 ? Number(key) - 1 : LETTERS.indexOf(key);
        if (n >= 0 && n < item.question.options.length) choose(n);
        if ((key === "enter" || key === "arrowright") && selected !== null) advance();
      } else if (key === " ") {
        event.preventDefault();
        setFlipped((f) => !f);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, item, choose, selected, advance]);

  if (items.length === 0) return <Empty summary={summary} />;
  if (!started) {
    return (
      <div className="mx-auto max-w-3xl">
        <Intro summary={summary} count={items.length} onStart={() => setStarted(true)} />
      </div>
    );
  }

  if (finished) {
    const remembered = results.filter(Boolean).length;
    const more = summary.due - items.length;
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card mx-auto max-w-2xl p-8 text-center sm:p-10">
        <ProgressRing value={remembered} max={items.length} size={150} stroke={12} label="Ibyo wibutse" className="mx-auto">
          <span>
            <span className="block font-display text-4xl font-extrabold">
              {remembered}/{items.length}
            </span>
            <span className="text-sm font-semibold text-muted">wabyibutse</span>
          </span>
        </ProgressRing>
        <h2 className="mt-6 text-3xl font-extrabold">
          {remembered === items.length ? "Wabyibutse byose! 🎉" : "Isubiramo rirangiye!"}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Ibyo wibutse byimukiye mu gasanduku gakurikira. Ibyo wibagiwe bizagaruka ejo, kugeza ubimenye neza.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {more > 0 ? (
            <Button onClick={() => router.refresh()}>
              <Repeat className="size-4" aria-hidden /> Komeza: {plural(more, "igisigaye", "ibisigaye")}
            </Button>
          ) : (
            <ButtonLink href="/imyitozo">
              <Target className="size-4" aria-hidden /> Witoze ibindi
            </ButtonLink>
          )}
          <ButtonLink href="/ikibaho" variant="secondary">
            Ikibaho cyanjye
          </ButtonLink>
        </div>
      </motion.div>
    );
  }

  const answered = selected !== null;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/ikibaho"
          aria-label="Subira ku kibaho"
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-muted transition hover:text-ink"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3 text-sm font-semibold">
            <span className="flex min-w-0 items-center gap-2">
              <Repeat className="size-4 shrink-0 text-ocean-600 dark:text-ocean-300" aria-hidden />
              <span className="truncate">Isubiramo · agasanduku {item.box}</span>
            </span>
            <span className="shrink-0 text-muted">
              {index + 1}/{items.length}
            </span>
          </div>
          <ProgressBar
            value={index + (answered ? 1 : 0)}
            max={items.length}
            className="mt-2"
            barClassName="from-ocean-400 to-brand-500"
            label="Aho ugeze"
          />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${item.kind}-${item.kind === "question" ? item.question.id : item.sign.id}`}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={{ duration: 0.22 }}
        >
          {item.kind === "question" ? (
            <div className="card p-5 sm:p-8">
              <QuestionView
                text={item.question.text}
                image={item.question.image}
                options={item.question.options}
                states={optionStates(item.question.options.length, selected, answered ? item.question.answer : null)}
                onSelect={choose}
                disabled={answered}
                topicLabel={topicName(item.question.topic)}
                audio={item.question.audio}
              />
              {answered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
                  <div
                    className={cn(
                      "flex items-start gap-3 rounded-2xl p-4",
                      selected === item.question.answer ? "bg-brand-50 dark:bg-brand-500/12" : "bg-signal-50 dark:bg-signal-500/10",
                    )}
                  >
                    {selected === item.question.answer ? (
                      <CircleCheck className="mt-0.5 size-6 shrink-0 text-brand-600" aria-hidden />
                    ) : (
                      <CircleX className="mt-0.5 size-6 shrink-0 text-signal-600" aria-hidden />
                    )}
                    <p
                      className={cn(
                        "font-bold",
                        selected === item.question.answer ? "text-brand-700 dark:text-brand-300" : "text-signal-700 dark:text-signal-300",
                      )}
                    >
                      {selected === item.question.answer
                        ? "Wabyibutse! Kizagaruka nyuma y’igihe kirekire."
                        : `Si byo: igisubizo ni (${LETTERS[item.question.answer]}). Kizagaruka ejo.`}
                    </p>
                  </div>
                  <Explanation text={item.question.explanation} lawRef={item.question.law_ref} audio={item.question.explanation_audio} />
                  <Button onClick={advance} size="lg" className="w-full sm:w-auto">
                    {index + 1 >= items.length ? "Reba uko wakoze" : "Ibikurikira"} <ArrowRight className="size-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-xl">
              <SignFlipCard sign={item.sign} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="secondary" size="lg" onClick={() => recall(false)}>
                  <X className="size-5 text-signal-500" aria-hidden /> Sinari nkizi
                </Button>
                <Button size="lg" onClick={() => recall(true)}>
                  <Check className="size-5" aria-hidden /> Nari nkizi
                </Button>
              </div>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
                <CalendarClock className="size-3.5" aria-hidden /> Banza wibuke icyo bivuze, hanyuma uhindukize ikarita.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
