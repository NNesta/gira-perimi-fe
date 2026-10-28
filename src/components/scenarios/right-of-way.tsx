"use client";

import { ArrowDown, ArrowRight, BookOpen, CircleCheck, CircleX, Play, RotateCcw, Target, Undo2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Explanation } from "@/components/quiz/explanation";
import { Intersection, type Mark } from "@/components/scenarios/intersection";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { cn } from "@/lib/cn";
import { COLORS, MOVE_LABEL, SCENARIOS, SIGN_LABEL, type Scenario, type SignKind } from "@/lib/scenarios";

function marksFor(scenario: Scenario, picks: string[], revealed: boolean): Record<string, Mark> {
  const ordered = scenario.answer.length > 1;
  if (!revealed) {
    return Object.fromEntries(picks.map((id, i) => [id, { tone: "pick", label: ordered ? String(i + 1) : undefined }]));
  }
  if (ordered) {
    return Object.fromEntries(
      scenario.answer.map((id, i) => [id, { tone: picks[i] === id ? "right" : "wrong", label: String(i + 1) }]),
    );
  }
  const marks: Record<string, Mark> = { [scenario.answer[0]]: { tone: "right" } };
  if (picks[0] && picks[0] !== scenario.answer[0]) marks[picks[0]] = { tone: "wrong" };
  return marks;
}

function Legend({ scenario }: { scenario: Scenario }) {
  const signs = [...new Set(Object.values(scenario.signs ?? {}))] as SignKind[];
  const lights = Object.values(scenario.lights ?? {});
  if (!signs.length && !lights.length && !scenario.dirt) return null;
  return (
    <ul className="mt-4 space-y-1.5 text-sm text-muted">
      {signs.map((sign) => (
        <li key={sign}>· {SIGN_LABEL[sign]}</li>
      ))}
      {lights.includes("off") && <li>· Amatara y’isangano ntakora</li>}
      {lights.some((l) => l !== "off") && <li>· Itara ry’icyatsi: komeza · Itara ritukura: hagarara</li>}
      {scenario.dirt && <li>· Inzira y’igitaka (itari kaburimbo)</li>}
    </ul>
  );
}

/** "Ninde utambuka mbere?": tap the vehicle that goes first (or every vehicle, in order), then watch them go. */
export function RightOfWay({ scenarios = SCENARIOS }: { scenarios?: Scenario[] }) {
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [playKey, setPlayKey] = useState(0);

  if (index >= scenarios.length) {
    const ratio = score / scenarios.length;
    return (
      <div className="card mx-auto max-w-xl p-8 text-center sm:p-10">
        <ProgressRing
          value={score}
          max={scenarios.length}
          size={140}
          stroke={12}
          barClassName={ratio >= 0.7 ? "stroke-brand-500" : "stroke-sun-400"}
          label="Ibisubizo by’ukuri"
          className="mx-auto"
        >
          <span className="font-display text-4xl font-extrabold">
            {score}/{scenarios.length}
          </span>
        </ProgressRing>
        <h2 className="mt-6 text-3xl font-extrabold">
          {ratio >= 0.85 ? "Uri umuhanga mu gutambuka mbere!" : ratio >= 0.6 ? "Ni byiza cyane!" : "Komeza witoze!"}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Ibi bibazo ni byo bigora benshi mu kizamini. Ongera ubikore kugeza ubisubije byose nta gushidikanya.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Button
            onClick={() => {
              setIndex(0);
              setScore(0);
              setPicks([]);
              setRevealed(false);
              setPlayKey(0);
            }}
          >
            <RotateCcw className="size-4" /> Ongera utangire
          </Button>
          <ButtonLink href="/amasomo/gutambuka-mbere" variant="secondary">
            <BookOpen className="size-4" /> Soma isomo
          </ButtonLink>
          <ButtonLink href="/imyitozo/kwitoza?topic=gutambuka-mbere&count=10" variant="secondary">
            <Target className="size-4" /> Ibibazo by’ikizamini
          </ButtonLink>
        </div>
      </div>
    );
  }

  const scenario = scenarios[index];
  const ordered = scenario.answer.length > 1;
  const question = ordered ? "Bakurikirana bate?" : "Ninde utambuka mbere?";
  const right = revealed && picks.join() === scenario.answer.join();
  const marks = marksFor(scenario, picks, revealed);

  function pick(id: string) {
    if (revealed || picks.includes(id)) return;
    const next = [...picks, id];
    setPicks(next);
    if (next.length === scenario.answer.length) {
      setRevealed(true);
      if (next.join() === scenario.answer.join()) setScore((s) => s + 1);
      setPlayKey((k) => k + 1);
    }
  }

  function nextScene() {
    setIndex((i) => i + 1);
    setPicks([]);
    setRevealed(false);
    setPlayKey(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3 text-sm font-semibold">
          <span className="rounded-full bg-ocean-50 px-3 py-1 text-xs font-bold text-ocean-700 dark:bg-ocean-500/15 dark:text-ocean-300">
            {scenario.tag}
          </span>
          <span className="tabular-nums text-muted">
            {index + 1}/{scenarios.length}
          </span>
        </div>
        <ProgressBar value={index + (revealed ? 1 : 0)} max={scenarios.length} label="Aho ugeze" />
        {/* On phones the panel sits below the drawing: say what to do above it. */}
        <p className="mt-4 text-lg font-extrabold lg:hidden">
          {question}{" "}
          <span className="text-base font-semibold text-muted">
            {ordered ? "Kanda ku binyabiziga byose ukurikije uko bitambuka." : "Kanda ku kinyabiziga."}
          </span>
        </p>
        <div className="relative mt-3 overflow-hidden rounded-3xl border border-line shadow-soft lg:mt-4">
          <Intersection key={scenario.id} scenario={scenario} marks={marks} onPick={revealed ? undefined : pick} playKey={playKey} />
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-x-3 top-3 flex items-center justify-between gap-2"
            >
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-white shadow-lift",
                  right ? "bg-brand-600" : "bg-signal-600",
                )}
              >
                {right ? <CircleCheck className="size-4" /> : <CircleX className="size-4" />} {right ? "Ni byo!" : "Si byo"}
              </span>
              <button
                type="button"
                onClick={() => document.getElementById("impamvu")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-asphalt shadow-lift lg:hidden"
              >
                Reba impamvu <ArrowDown className="size-4" />
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="card p-5 sm:p-6 lg:sticky lg:top-24">
        <h2 className="hidden text-2xl font-extrabold lg:block">{question}</h2>
        <p className="text-sm text-muted lg:mt-1">
          {ordered
            ? "Kanda ku binyabiziga byose, uhereye ku gitambuka mbere."
            : "Kanda ku kinyabiziga gitambuka mbere, ku gishushanyo cyangwa hano hasi."}
        </p>

        <div className="mt-4 grid gap-2" role="group" aria-label="Ibinyabiziga">
          {scenario.vehicles.map((v) => {
            const mark = marks[v.id];
            const color = v.kind === "ambulance" ? "#1d6fe8" : COLORS[v.id]?.body;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => pick(v.id)}
                disabled={revealed || picks.includes(v.id)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-2 px-3.5 py-2.5 text-left transition",
                  !mark && "border-line bg-surface enabled:hover:-translate-y-0.5 enabled:hover:border-brand-300",
                  mark?.tone === "pick" && "border-ink bg-surface-2",
                  mark?.tone === "right" && "border-brand-500 bg-brand-50 dark:bg-brand-500/12",
                  mark?.tone === "wrong" && "border-signal-400 bg-signal-50 dark:bg-signal-500/12",
                )}
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-xl border-[3px] bg-white font-extrabold text-asphalt"
                  style={{ borderColor: color }}
                >
                  {v.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {v.kind === "ambulance" ? "Imbangukiragutabara" : "Imodoka"} {v.id}
                  </span>
                  <span className="block text-sm text-muted">{MOVE_LABEL[v.move]}</span>
                </span>
                {mark?.label && (
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white",
                      mark.tone === "right" ? "bg-brand-500" : mark.tone === "wrong" ? "bg-signal-500" : "bg-ink",
                    )}
                  >
                    {mark.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {ordered && !revealed && picks.length > 0 && (
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setPicks((p) => p.slice(0, -1))}>
            <Undo2 className="size-4" /> Siba icya nyuma
          </Button>
        )}

        <Legend scenario={scenario} />

        <AnimatePresence>
          {revealed && (
            <motion.div id="impamvu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 scroll-mt-24 space-y-3">
              <p
                className={cn(
                  "flex items-start gap-2 rounded-2xl p-3.5 font-bold",
                  right
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/12 dark:text-brand-300"
                    : "bg-signal-50 text-signal-700 dark:bg-signal-500/10 dark:text-signal-300",
                )}
              >
                {right ? <CircleCheck className="mt-0.5 size-5 shrink-0" /> : <CircleX className="mt-0.5 size-5 shrink-0" />}
                {right
                  ? "Ni byo!"
                  : ordered
                    ? `Si byo. Uko bakurikirana: ${scenario.answer.join(" → ")}.`
                    : `Si byo. ${scenario.answer[0]} ni yo itambuka mbere.`}
              </p>
              <Explanation text={scenario.explanation} lawRef={scenario.law} compact />
              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
                <Button variant="secondary" onClick={() => setPlayKey((k) => k + 1)}>
                  <Play className="size-4" /> Ongera urebe
                </Button>
                <Button onClick={nextScene} className="flex-1">
                  {index + 1 < scenarios.length ? "Ibikurikira" : "Reba amanota"} <ArrowRight className="size-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
