"use client";

import { ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { api, errorMessage } from "@/lib/api";
import type { QuestionWithAnswer } from "@/lib/types";

import { Explanation } from "./explanation";
import { optionStates, QuestionView } from "./question-view";

const COUNT = 5;

export function DemoQuiz() {
  const [questions, setQuestions] = useState<QuestionWithAnswer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setQuestions(null);
    try {
      setQuestions(await api<QuestionWithAnswer[]>(`/questions/sample?count=${COUNT}`));
      setIndex(0);
      setSelected(null);
      setScore(0);
      setFinished(false);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

  useEffect(() => {
    // Fetch-on-mount keeps the landing page fully static; the quiz is a random sample each visit.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-muted">{error}</p>
        <Button variant="secondary" className="mt-4" onClick={load}>
          <RotateCcw className="size-4" /> Ongera ugerageze
        </Button>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="card space-y-4 p-6 sm:p-8" aria-busy="true">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-4/5" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  const question = questions[index];
  const answered = selected !== null;

  function choose(i: number) {
    if (answered) return;
    setSelected(i);
    if (i === question.answer) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 >= questions!.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  if (finished) {
    const great = score >= 4;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card relative overflow-hidden p-8 text-center sm:p-12"
      >
        <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-400 via-ocean-400 to-sun-300" />
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15">
          <Sparkles className="size-8" />
        </span>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.14em] text-muted">Amanota yawe</p>
        <p className="mt-1 font-display text-6xl font-extrabold">
          {score}
          <span className="text-3xl text-muted">/{questions.length}</span>
        </p>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted">
          {great
            ? "Ni byiza cyane! Iyandikishe ubike aho ugeze, maze ukore ikizamini cyuzuye cy’ibibazo 20."
            : "Ntucike intege: ibi ni byo Gira Perimi igufasha kwiga. Iyandikishe utangire amasomo n’imyitozo."}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/injira" size="lg">
            Iyandikishe ku buntu <ArrowRight className="size-5" />
          </ButtonLink>
          <Button variant="secondary" size="lg" onClick={load}>
            <RotateCcw className="size-5" /> Ibindi bibazo 5
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="card p-5 sm:p-8">
      <div className="mb-6 flex items-center gap-4">
        <ProgressBar value={index + (answered ? 1 : 0)} max={questions.length} label="Aho ugeze" />
        <span className="shrink-0 text-sm font-bold text-muted">
          {score} ✓
        </span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <QuestionView
            number={index + 1}
            total={questions.length}
            text={question.text}
            image={question.image}
            options={question.options}
            states={optionStates(question.options.length, selected, answered ? question.answer : null)}
            onSelect={choose}
            disabled={answered}
          />
        </motion.div>
      </AnimatePresence>
      {answered && <Explanation text={question.explanation} lawRef={question.law_ref} compact className="mt-5" />}
      <div className="mt-6 flex min-h-12 items-center justify-between gap-4">
        <AnimatePresence>
          {answered && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={selected === question.answer ? "font-bold text-brand-600" : "font-bold text-signal-600"}
            >
              {selected === question.answer ? "Ni byo! 🎉" : "Si byo. Reba igisubizo cy’ukuri."}
            </motion.p>
          )}
        </AnimatePresence>
        <Button onClick={next} disabled={!answered} className="ml-auto">
          {index + 1 >= questions.length ? "Reba amanota" : "Ibikurikira"} <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
