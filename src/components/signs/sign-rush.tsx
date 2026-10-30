"use client";
/* eslint-disable @next/next/no-img-element -- sign scans are served by the API */

import confetti from "canvas-confetti";
import { ArrowRight, CircleCheck, CircleX, Flame, Gauge, Grid3x3, Heart, MessageCircle, Play, Repeat, RotateCcw, Timer, Trophy, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { type RoadState, SignRoad } from "@/components/signs/sign-road";
import { Button, ButtonLink } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { LIVES, multiplier, options, points, readBest, retryLater, roundSeconds, saveBest, shuffle } from "@/lib/sign-rush";
import type { Sign } from "@/lib/types";

type Feedback = { kind: "right"; gained: number } | { kind: "wrong"; picked: string } | { kind: "late" } | null;

const RULES = [
  { icon: Timer, text: "Hitamo icyo icyapa gisobanura mbere y’uko imodoka ikigeraho." },
  { icon: Zap, text: "Uko usubiza vuba, ni ko ubona amanota menshi." },
  { icon: Flame, text: "Ibisubizo by’ukuri bikurikiranye bikuba amanota: ×2, ×3, ×4." },
  { icon: Heart, text: `Ufite amahirwe ${LIVES}. Iyo wibeshye cyangwa ugatinda, utakaza rimwe.` },
  { icon: Gauge, text: "Uko ugenda, imodoka irihuta, n’ibyapa bisa bikaba byinshi." },
];

function Lives({ left }: { left: number }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1.5 backdrop-blur" aria-label={`Amahirwe ${left} kuri ${LIVES}`}>
      {Array.from({ length: LIVES }, (_, i) => (
        <Heart key={i} className={cn("size-4", i < left ? "fill-signal-500 text-signal-500" : "text-white/45")} aria-hidden />
      ))}
    </span>
  );
}

function Intro({ best, onStart }: { best: number; onStart: () => void }) {
  return (
    <div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
      <SignRoad sign={null} roundKey={0} duration={9} state="idle" />
      <div className="card p-6 sm:p-7">
        <h2 className="text-2xl font-extrabold">Uko bikinwa</h2>
        <ul className="mt-4 space-y-3">
          {RULES.map((rule) => (
            <li key={rule.text} className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                <rule.icon className="size-4" aria-hidden />
              </span>
              <span className="pt-1 text-[0.95rem] leading-snug text-ink-soft">{rule.text}</span>
            </li>
          ))}
        </ul>
        {best > 0 && (
          <p className="mt-5 flex items-center gap-2 rounded-2xl bg-sun-50 px-4 py-3 font-semibold text-sun-700 dark:bg-sun-400/10 dark:text-sun-300">
            <Trophy className="size-5 shrink-0" aria-hidden /> Agahigo kawe: {best}
          </p>
        )}
        <Button size="lg" className="mt-6 w-full" onClick={onStart}>
          <Play className="size-5" /> Tangira
        </Button>
        <p className="mt-3 hidden text-center text-xs text-muted lg:block">Ku mudasobwa: kanda 1, 2, 3 cyangwa 4.</p>
      </div>
    </div>
  );
}

type Run = { score: number; correct: number; bestCombo: number; missed: Sign[] };

function Results({
  run,
  best,
  record,
  signedIn,
  onRestart,
}: {
  run: Run;
  best: number;
  /** This run set a new best score on this device. */
  record: boolean;
  signedIn: boolean;
  onRestart: () => void;
}) {
  const { score, correct, bestCombo, missed } = run;
  const url = `${window.location.origin}/imyitozo/soma-icyapa`;
  const text = `Nabonye amanota ${score} muri “Soma icyapa!” kuri Tsinda Neza 🚦 Nasomye neza ibyapa ${correct}. Hangana nanjye:`;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card p-7 text-center sm:p-10">
        {record && (
          <span className="inline-flex animate-pop items-center gap-1.5 rounded-full bg-sun-300 px-3.5 py-1.5 text-sm font-extrabold text-asphalt">
            <Trophy className="size-4" aria-hidden /> Agahigo gashya!
          </span>
        )}
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.14em] text-muted">Amanota</p>
        <p className="mt-1 font-display text-6xl font-extrabold tabular-nums sm:text-7xl">{score}</p>
        <dl className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3">
          {[
            ["Ibyapa wasomye neza", correct],
            ["Uruhererekane rurerure", bestCombo],
            ["Agahigo kawe", best],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col justify-between rounded-2xl bg-surface-2 px-2 py-3">
              <dt className="text-xs font-semibold leading-tight text-muted">{label}</dt>
              <dd className="mt-1 text-2xl font-extrabold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mx-auto mt-6 max-w-md text-muted">
          {correct >= 25
            ? "Uri intyoza mu byapa! Ibi ni byo bizagufasha mu kizamini no ku muhanda."
            : correct >= 10
              ? "Ni byiza! Ongera ukine, urebe niba waca agahigo kawe."
              : "Komeza witoze: buri mukino ugufasha kwibuka ibyapa byinshi."}
        </p>
        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          <Button size="lg" onClick={onRestart}>
            <RotateCcw className="size-5" /> Ongera ukine
          </Button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#25d366] px-6 font-semibold text-[#08361c] shadow-soft transition hover:brightness-95"
          >
            <MessageCircle className="size-5" aria-hidden /> Hangana n’inshuti
          </a>
        </div>
        {signedIn ? (
          missed.length > 0 && (
            <p className="mx-auto mt-5 flex max-w-sm items-start justify-center gap-1.5 text-sm text-muted">
              <Repeat className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Ibyapa wibeshyeho byongewe mu{" "}
                <Link href="/isubiramo" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
                  isubiramo ryawe
                </Link>
                : bizagaruka ejo.
              </span>
            </p>
          )
        ) : (
          <p className="mx-auto mt-5 max-w-sm text-sm text-muted">
            <Link href="/injira?next=/imyitozo/soma-icyapa" className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
              Injira
            </Link>{" "}
            kugira ngo ibyapa wibeshyeho bigaruke mu isubiramo ryawe.
          </p>
        )}
      </div>

      {missed.length > 0 && (
        <section className="card p-5 sm:p-7">
          <h2 className="text-xl font-extrabold">Ibyapa wibeshyeho</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {missed.map((s) => (
              <li key={s.id} className="flex items-start gap-3 rounded-2xl border border-line p-3">
                <span className="paper flex size-16 shrink-0 items-center justify-center p-1.5">
                  <img src={s.image} alt="" className="max-h-full max-w-full object-contain" />
                </span>
                <span className="min-w-0">
                  <span className="text-xs font-bold tracking-wide text-muted">{s.code}</span>
                  <span className="block font-bold leading-snug">{s.name}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-muted">{s.description}</span>
                </span>
              </li>
            ))}
          </ul>
          <ButtonLink href="/ibyapa" variant="secondary" className="mt-5">
            <Grid3x3 className="size-4" /> Reba ibyapa byose
          </ButtonLink>
        </section>
      )}
    </div>
  );
}

/**
 * "Soma icyapa!": a sign comes towards the car, the learner picks its meaning before the car reaches it. Signed-in
 * learners' answers feed their spaced review, like the flashcards: a missed sign comes back tomorrow.
 */
export function SignRush({ signs, signedIn = false }: { signs: Sign[]; signedIn?: boolean }) {
  const [phase, setPhase] = useState<"intro" | "play" | "over">("intro");
  const [deck, setDeck] = useState<Sign[]>([]);
  const [round, setRound] = useState(0);
  const [choices, setChoices] = useState<Sign[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [lives, setLives] = useState(LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState<Sign[]>([]);
  const [best, setBest] = useState(0);
  const [record, setRecord] = useState(false);
  const remaining = useRef(1);
  const top = useRef<HTMLDivElement>(null);
  const correction = useRef<HTMLDivElement>(null);
  const goOn = useRef<HTMLButtonElement>(null);

  const sign = deck.length ? deck[round % deck.length] : null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the record lives in this browser's storage
    setBest(readBest());
  }, []);

  function recall(id: string, known: boolean) {
    if (signedIn) api("/review/signs", { method: "POST", json: { sign_id: id, known } }).catch(() => undefined);
  }

  function start() {
    const fresh = shuffle(signs);
    setDeck(fresh);
    setRound(0);
    setChoices(options(fresh[0], signs, 0));
    setFeedback(null);
    setLives(LIVES);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setCorrect(0);
    setMissed([]);
    setRecord(false);
    setPhase("play");
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function miss(picked: string | null) {
    if (!sign || feedback) return;
    setLives((l) => l - 1);
    setCombo(0);
    setMissed((m) => (m.some((s) => s.id === sign.id) ? m : [...m, sign]));
    setDeck((d) => retryLater(d, round, sign));
    setFeedback(picked ? { kind: "wrong", picked } : { kind: "late" });
    recall(sign.id, false);
  }

  function answer(choice: Sign) {
    if (!sign || feedback || phase !== "play") return;
    if (choice.id !== sign.id) return miss(choice.id);
    const run = combo + 1;
    const gained = points(remaining.current, run);
    setScore((s) => s + gained);
    setCombo(run);
    setBestCombo((b) => Math.max(b, run));
    setCorrect((c) => c + 1);
    setFeedback({ kind: "right", gained });
    recall(sign.id, true);
  }

  function finish() {
    setPhase("over");
    if (score > best) {
      saveBest(score);
      setBest(score);
      setRecord(true);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        void confetti({ particleCount: 110, spread: 80, origin: { y: 0.4 }, colors: ["#129b68", "#fad201", "#00a1de", "#ffffff"] });
      }
    }
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function next() {
    if (lives <= 0) return finish();
    const r = round + 1;
    setRound(r);
    setChoices(options(deck[r % deck.length], signs, r));
    setFeedback(null);
  }

  // A right answer moves on by itself once the sign has gone past; a wrong one waits for "Komeza".
  const advance = useEffectEvent(next);
  useEffect(() => {
    if (feedback?.kind !== "right") return;
    const timer = setTimeout(advance, 850);
    return () => clearTimeout(timer);
  }, [feedback]);

  // After a mistake: "Komeza" takes the keyboard, and the page scrolls just enough to show the correction.
  useEffect(() => {
    if (!feedback || feedback.kind === "right") return;
    goOn.current?.focus({ preventScroll: true });
    correction.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [feedback]);

  // Load the next sign's picture while this one is on the road.
  useEffect(() => {
    const upcoming = deck[(round + 1) % deck.length];
    if (upcoming) new Image().src = upcoming.image;
  }, [deck, round]);

  // Keys 1–4 answer, Enter or Space goes on after a mistake (buttons keep their own Enter).
  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (phase !== "play" || (event.target as HTMLElement).closest("button, a, input, textarea")) return;
    const index = Number(event.key) - 1;
    if (!feedback && index >= 0 && index < choices.length) answer(choices[index]);
    else if (feedback && feedback.kind !== "right" && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      next();
    }
  });
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (phase !== "play") {
    return (
      <div ref={top} className="scroll-mt-24">
        {phase === "intro" ? (
          <Intro best={best} onStart={start} />
        ) : (
          <Results run={{ score, correct, bestCombo, missed }} best={best} record={record} signedIn={signedIn} onRestart={start} />
        )}
      </div>
    );
  }

  const state: RoadState = !feedback ? "run" : feedback.kind === "right" ? "right" : "wrong";
  const x = multiplier(combo);

  return (
    <div ref={top} className="mx-auto grid max-w-5xl scroll-mt-20 items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
      <SignRoad sign={sign} roundKey={round} duration={roundSeconds(round)} state={state} remaining={remaining} onTimeout={() => miss(null)}>
        <div className="absolute inset-x-3 top-4 flex items-start justify-between gap-2">
          <div className="flex flex-col items-start gap-1.5">
            <span className="rounded-full bg-black/45 px-3 py-1 font-display text-lg font-extrabold tabular-nums text-white backdrop-blur">{score}</span>
            {x > 1 && (
              <span key={x} className="inline-flex animate-pop items-center gap-1 rounded-full bg-sun-300 px-2.5 py-0.5 text-sm font-extrabold text-asphalt">
                <Flame className="size-3.5" aria-hidden /> ×{x}
              </span>
            )}
          </div>
          <Lives left={lives} />
        </div>
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={round}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 top-[38%] flex justify-center"
              aria-live="polite"
            >
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-lg font-extrabold text-white shadow-lift",
                  feedback.kind === "right" ? "bg-brand-600" : "bg-signal-600",
                )}
              >
                {feedback.kind === "right" ? (
                  <>
                    <CircleCheck className="size-5" aria-hidden /> +{feedback.gained}
                  </>
                ) : (
                  <>
                    <CircleX className="size-5" aria-hidden /> {feedback.kind === "late" ? "Watinze!" : "Si byo"}
                  </>
                )}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </SignRoad>

      <div className="card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 text-sm font-semibold text-muted">
          <span>Icyapa cya {round + 1}</span>
          {best > 0 && (
            <span className="inline-flex items-center gap-1">
              <Trophy className="size-4" aria-hidden /> {best}
            </span>
          )}
        </div>
        <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">Iki cyapa gisobanura iki?</h2>
        <div className="mt-3 grid gap-2" role="group" aria-label="Ibisubizo">
          {choices.map((choice, i) => {
            const isAnswer = feedback && choice.id === sign?.id;
            const isPicked = feedback?.kind === "wrong" && feedback.picked === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => answer(choice)}
                disabled={!!feedback}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-2 px-3.5 py-3 text-left font-semibold leading-snug transition",
                  !feedback && "border-line bg-surface active:scale-[0.99] enabled:hover:border-brand-300",
                  feedback && !isAnswer && !isPicked && "border-line opacity-55",
                  isAnswer && "border-brand-500 bg-brand-50 dark:bg-brand-500/12",
                  isPicked && "border-signal-400 bg-signal-50 dark:bg-signal-500/12",
                )}
              >
                <span className="hidden size-7 shrink-0 place-items-center rounded-lg bg-surface-2 text-sm font-extrabold text-muted lg:grid">{i + 1}</span>
                <span className="min-w-0 flex-1">{choice.name}</span>
                {isAnswer && <CircleCheck className="size-5 shrink-0 text-brand-600" aria-hidden />}
                {isPicked && <CircleX className="size-5 shrink-0 text-signal-500" aria-hidden />}
              </button>
            );
          })}
        </div>

        {feedback && feedback.kind !== "right" && sign && (
          <motion.div
            ref={correction}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 scroll-mb-24 space-y-3 lg:scroll-mb-6"
          >
            {/* The sign again, beside its meaning: on a phone the road has scrolled away by now. */}
            <div className="flex items-start gap-3 rounded-2xl bg-surface-2 p-3.5">
              <span className="paper flex size-16 shrink-0 items-center justify-center p-1.5">
                <img src={sign.image} alt="" className="max-h-full max-w-full object-contain" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Igisubizo cy’ukuri · {sign.code}</p>
                <p className="mt-1 font-bold leading-snug">{sign.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{sign.description}</p>
                {lives > 0 && <p className="mt-2 text-xs font-semibold text-muted">Kizagaruka nyuma y’ibyapa bike.</p>}
              </div>
            </div>
            <Button ref={goOn} size="lg" className="w-full" onClick={next}>
              {lives > 0 ? "Komeza" : "Reba amanota"} <ArrowRight className="size-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
