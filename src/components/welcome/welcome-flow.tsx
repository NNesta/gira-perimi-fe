"use client";

import {
  ArrowLeft,
  ArrowRight,
  BellRing,
  BookOpen,
  CalendarDays,
  Check,
  CircleCheck,
  CircleX,
  LoaderCircle,
  RotateCcw,
  Target,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { Logo } from "@/components/brand/logo";
import { PushToggle } from "@/components/plan/push-toggle";
import { Explanation } from "@/components/quiz/explanation";
import { optionStates, QuestionView } from "@/components/quiz/question-view";
import { Button, ButtonLink } from "@/components/ui/button";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { api, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { firstName, formatDayLong, kigaliToday } from "@/lib/format";
import { DynamicIcon } from "@/lib/icons";
import type { LessonSummary, PlacementResult, PracticeSet, QuestionWithAnswer, Topic, User } from "@/lib/types";

type Stage = "date" | "goal" | "intro" | "quiz" | "result";
type Lesson = Pick<LessonSummary, "slug" | "title" | "order" | "topics">;
type Answer = { question: QuestionWithAnswer; selected: number };

const STEPS = ["Itariki", "Intego", "Isuzuma"];
const STEP_OF: Record<Stage, number> = { date: 0, goal: 1, intro: 2, quiz: 2, result: 2 };
const QUICK_DATES = [
  { days: 14, label: "Mu byumweru 2" },
  { days: 30, label: "Mu kwezi kumwe" },
  { days: 60, label: "Mu mezi 2" },
];
// About 30 seconds a question.
const GOALS = [
  { n: 10, label: "Gahoro gahoro" },
  { n: 20, label: "Bisanzwe" },
  { n: 30, label: "Nshyizemo umwete" },
  { n: 50, label: "Ikizamini kiri hafi" },
];

function daysUntil(day: string): number {
  return Math.round((Date.parse(day) - Date.parse(kigaliToday())) / 86_400_000);
}

function countdown(days: number): string {
  if (days === 0) return "ni uyu munsi";
  if (days === 1) return "ni ejo";
  return `hasigaye iminsi ${days}`;
}

/** The closer the exam, the bigger the suggested daily goal. */
function suggestedGoal(examDate: string): number {
  if (!examDate) return 20;
  const days = daysUntil(examDate);
  return days <= 14 ? 50 : days <= 30 ? 30 : 20;
}

/** The lesson that teaches a topic best: one where it is the main topic, other than the introduction. */
function lessonFor(topic: string, lessons: Lesson[]): Lesson | undefined {
  const covering = lessons.filter((l) => l.topics.includes(topic)).sort((a, b) => a.order - b.order);
  return covering.find((l) => l.topics[0] === topic && l.order > 1) ?? covering.find((l) => l.order > 1) ?? covering[0];
}

function Steps({ current }: { current: number }) {
  return (
    <ol className="mt-8 grid grid-cols-3 gap-2" aria-label="Intambwe">
      {STEPS.map((label, i) => (
        <li key={label} aria-current={i === current ? "step" : undefined}>
          <span
            className={cn(
              "block h-1.5 rounded-full transition-colors duration-300",
              i <= current ? "bg-brand-500" : "bg-surface-2 ring-1 ring-line",
            )}
          />
          <span
            className={cn(
              "mt-2 flex items-center gap-1.5 text-xs font-bold sm:text-sm",
              i === current ? "text-ink" : "text-muted",
            )}
          >
            {i < current ? (
              <Check className="size-3.5 text-brand-600" aria-hidden />
            ) : (
              <span className="tabular-nums">{i + 1}.</span>
            )}
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Heading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div>
      {eyebrow && <p className="text-sm font-bold text-brand-600 dark:text-brand-300">{eyebrow}</p>}
      <h1 className="mt-1 text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h1>
      {children && <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{children}</p>}
    </div>
  );
}

/**
 * First-time welcome: (1) exam date, (2) daily goal and reminders, (3) a placement quiz with one question per topic
 * that names the weakest topics. Each step is saved as it is completed; "Simbuka" ends the welcome at any point.
 */
export function WelcomeFlow({
  user,
  topics,
  lessons,
  remindersAvailable,
  pushPublicKey,
  next,
}: {
  user: User;
  topics: Topic[];
  lessons: Lesson[];
  remindersAvailable: boolean;
  pushPublicKey: string | null;
  next: string;
}) {
  const router = useRouter();
  const dateId = useId();
  const [stage, setStage] = useState<Stage>("date");
  const [examDate, setExamDate] = useState(user.exam_date ?? "");
  const [goal, setGoal] = useState<number | null>(null);
  const [reminders, setReminders] = useState(user.reminders);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuestionWithAnswer[] | null>(null);
  const [quizAttempt, setQuizAttempt] = useState(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<PlacementResult | null>(null);

  const chosenGoal = goal ?? suggestedGoal(examDate);
  const topicById = new Map(topics.map((t) => [t.id, t]));

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const save = (json: Partial<User>) => api<User>("/me", { method: "PATCH", json });

  function go(to: Stage) {
    setError(null);
    setStage(to);
    window.scrollTo({ top: 0 });
  }

  function finish() {
    void run(async () => {
      await save({ onboarded: true });
      router.replace(next);
      router.refresh();
    });
  }

  // Fetch the quiz while the learner reads the introduction to it.
  useEffect(() => {
    if (stage !== "intro" || quiz) return;
    let live = true;
    api<PracticeSet>("/practice/placement")
      .then((set) => live && setQuiz(set.questions))
      .catch((e) => live && setError(errorMessage(e)));
    return () => {
      live = false;
    };
  }, [stage, quiz, quizAttempt]);

  const question = quiz?.[index];
  const answered = selected !== null;

  function choose(choice: number) {
    if (!question || answered) return;
    setSelected(choice);
    setAnswers((list) => [...list, { question, selected: choice }]);
  }

  function nextQuestion() {
    if (!quiz || !answered) return;
    if (index + 1 < quiz.length) {
      setSelected(null);
      setIndex((i) => i + 1);
      return;
    }
    void run(async () => {
      const json = { answers: answers.map((a) => ({ question_id: a.question.id, selected: a.selected })) };
      const saved = await api<PlacementResult>("/practice/placement", { method: "POST", json });
      await save({ onboarded: true });
      setResult(saved);
      go("result");
    });
  }

  const step = STEP_OF[stage];
  const back: Stage | null = stage === "goal" ? "date" : stage === "intro" ? "goal" : null;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div aria-hidden className="bg-grid absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_55%)]" />
      <div
        aria-hidden
        className="absolute -right-24 -top-32 size-96 rounded-full bg-gradient-to-br from-brand-300/35 to-ocean-300/25 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-dvh max-w-2xl flex-col px-4 pb-10 pt-5 sm:pt-8">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          {stage !== "result" && (
            <Button variant="ghost" size="sm" onClick={finish} disabled={busy}>
              Simbuka
            </Button>
          )}
        </header>

        <Steps current={step} />

        <AnimatePresence mode="wait" initial={false}>
          <motion.section
            key={stage === "quiz" ? `quiz-${index}` : stage}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="mt-8 flex-1"
          >
            {stage === "date" && (
              <>
                <Heading eyebrow={`Ikaze, ${firstName(user.name, user.given_name)}! 👋`} title="Ikizamini cyawe kizaba ryari?">
                  Tuzakubarira iminsi isigaye, tukwereke n’ibyo ukwiye gukora buri munsi kugira ngo uzagere ku munsi
                  w’ikizamini witeguye.
                </Heading>
                <div className="card mt-7 p-5 sm:p-6">
                  <label htmlFor={dateId} className="flex items-center gap-2 text-sm font-semibold text-muted">
                    <CalendarDays className="size-4" aria-hidden /> Itariki y’ikizamini
                  </label>
                  <input
                    id={dateId}
                    type="date"
                    value={examDate}
                    min={kigaliToday()}
                    max={kigaliToday(730)}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-line bg-surface px-3.5 text-lg text-ink outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 sm:w-72"
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {QUICK_DATES.map(({ days, label }) => {
                      const day = kigaliToday(days);
                      return (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setExamDate(day)}
                          aria-pressed={examDate === day}
                          className={cn(
                            "h-9 rounded-full border px-3.5 text-sm font-semibold transition",
                            examDate === day
                              ? "border-brand-500 bg-brand-500 text-white"
                              : "border-line bg-surface text-ink-soft hover:border-brand-300",
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {examDate && (
                    <p className="mt-4 text-sm font-semibold text-brand-700 dark:text-brand-300">
                      {formatDayLong(examDate)} · {countdown(daysUntil(examDate))}
                    </p>
                  )}
                  <p className="mt-4 text-sm text-muted">
                    Itariki y’ikizamini uyisaba kuri Irembo. Niba utarayibona, ushobora kuyongeraho nyuma mu mwirondoro wawe.
                  </p>
                </div>
              </>
            )}

            {stage === "goal" && (
              <>
                <Heading title="Uzajya wiga angahe buri munsi?">
                  Kwiga gake buri munsi biruta kwiga byinshi rimwe na rimwe. Ushobora guhindura intego igihe icyo ari
                  cyo cyose.
                </Heading>
                <div className="mt-7 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Intego ya buri munsi">
                  {GOALS.map(({ n, label }) => {
                    const active = chosenGoal === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setGoal(n)}
                        className={cn(
                          "relative rounded-2xl border-2 p-4 text-left transition sm:p-5",
                          active
                            ? "border-brand-500 bg-brand-50 shadow-[0_0_0_4px_rgb(18_155_104/0.12)] dark:bg-brand-500/12"
                            : "border-line bg-surface hover:-translate-y-0.5 hover:border-brand-300",
                        )}
                      >
                        {n === suggestedGoal(examDate) && (
                          <span className="absolute right-3 top-3 rounded-full bg-sun-300 px-2 py-0.5 text-[0.7rem] font-bold text-asphalt">
                            Inama yacu
                          </span>
                        )}
                        <span className="block font-display text-3xl font-extrabold sm:text-4xl">{n}</span>
                        <span className="block text-sm font-semibold text-ink-soft">ibibazo · iminota ~{n / 2}</span>
                        <span className="mt-2 block text-sm text-muted">{label}</span>
                      </button>
                    );
                  })}
                </div>
                {remindersAvailable && (
                  <label className="card mt-4 flex cursor-pointer items-start justify-between gap-4 p-4 sm:p-5">
                    <span>
                      <span className="flex items-center gap-2 font-semibold">
                        <BellRing className="size-4 text-sun-600 dark:text-sun-300" aria-hidden /> Nyibutsa kuri imeyili
                      </span>
                      <span className="mt-1 block text-sm text-muted">
                        Buri mugoroba, niba utarageza ku ntego yawe y’uwo munsi.
                      </span>
                    </span>
                    <span className="relative mt-0.5 inline-flex shrink-0">
                      <input
                        type="checkbox"
                        checked={reminders}
                        onChange={(e) => setReminders(e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="h-7 w-12 rounded-full bg-surface-2 ring-1 ring-line transition peer-checked:bg-brand-500 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/25" />
                      <span className="absolute left-1 top-1 size-5 rounded-full bg-white shadow-soft transition peer-checked:translate-x-5" />
                    </span>
                  </label>
                )}
                <PushToggle publicKey={pushPublicKey} className="card mt-4 border-0 p-4 sm:p-5" />
              </>
            )}

            {stage === "intro" && (
              <>
                <Heading title="Reka turebe aho uhagaze">
                  Ibibazo 10 gusa, kimwe muri buri gice cy’ikizamini. Nta gihe ntarengwa kandi si ikizamini: bizatwereka
                  ibice ukwiye kwitaho mbere.
                </Heading>
                <ul className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                  {topics.map((topic) => (
                    <li key={topic.id} className="card flex items-center gap-2.5 p-3 sm:flex-col sm:p-4 sm:text-center">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                        <DynamicIcon name={topic.icon} className="size-[1.1rem]" />
                      </span>
                      <span className="text-xs font-semibold leading-snug text-ink-soft">{topic.name}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {stage === "quiz" && quiz && question && (
              <div>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>Isuzuma ry’ibanze</span>
                  <span className="tabular-nums text-muted">
                    {index + 1}/{quiz.length}
                  </span>
                </div>
                <ProgressBar value={index + (answered ? 1 : 0)} max={quiz.length} className="mt-2" label="Aho ugeze" />
                <div className="card mt-6 p-5 sm:p-7">
                  <QuestionView
                    number={index + 1}
                    total={quiz.length}
                    text={question.text}
                    image={question.image}
                    options={question.options}
                    states={optionStates(question.options.length, selected, answered ? question.answer : null)}
                    onSelect={choose}
                    disabled={answered}
                    topicLabel={topicById.get(question.topic)?.name}
                  />
                  {answered && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-3">
                      {selected === question.answer ? (
                        <p className="flex items-center gap-2 font-bold text-brand-700 dark:text-brand-300">
                          <CircleCheck className="size-5" aria-hidden /> Ni byo!
                        </p>
                      ) : (
                        <>
                          <p className="flex items-center gap-2 font-bold text-signal-700 dark:text-signal-300">
                            <CircleX className="size-5" aria-hidden /> Si byo. Igisubizo cy’ukuri kirerekanywe haruguru.
                          </p>
                          <Explanation text={question.explanation} lawRef={question.law_ref} compact />
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {stage === "result" && result && (
              <PlacementSummary
                result={result}
                answers={answers}
                topicById={topicById}
                lessons={lessons}
                next={next}
              />
            )}
          </motion.section>
        </AnimatePresence>

        {error && (
          <p role="alert" className="mt-5 rounded-2xl bg-signal-50 p-4 text-sm font-semibold text-signal-700 dark:bg-signal-500/10 dark:text-signal-200">
            {error}
          </p>
        )}

        {stage !== "result" && (
          <footer className="sticky bottom-0 -mx-4 mt-8 flex flex-col-reverse gap-3 border-t border-line/70 bg-bg/90 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            {back ? (
              <Button variant="ghost" onClick={() => go(back)} disabled={busy}>
                <ArrowLeft className="size-4" /> Subira inyuma
              </Button>
            ) : (
              <span className="hidden sm:block" />
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              {stage === "date" && (
                <>
                  <Button
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      run(async () => {
                        setExamDate("");
                        await save({ exam_date: null });
                        go("goal");
                      })
                    }
                  >
                    Sindabona itariki
                  </Button>
                  <Button
                    disabled={busy || !examDate}
                    onClick={() =>
                      run(async () => {
                        await save({ exam_date: examDate });
                        go("goal");
                      })
                    }
                  >
                    Komeza <ArrowRight className="size-4" />
                  </Button>
                </>
              )}
              {stage === "goal" && (
                <Button
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      const json: Partial<User> = { daily_goal: chosenGoal };
                      if (remindersAvailable) json.reminders = reminders;
                      await save(json);
                      go("intro");
                    })
                  }
                >
                  <Target className="size-4" /> Bika intego ya {chosenGoal}
                </Button>
              )}
              {stage === "intro" && (
                <>
                  <Button variant="secondary" onClick={finish} disabled={busy}>
                    Nzabikora nyuma
                  </Button>
                  {error && !quiz ? (
                    <Button
                      onClick={() => {
                        setError(null);
                        setQuizAttempt((n) => n + 1);
                      }}
                    >
                      <RotateCcw className="size-4" /> Ongera ugerageze
                    </Button>
                  ) : (
                    <Button onClick={() => go("quiz")} disabled={busy || !quiz}>
                      {quiz ? (
                        <>
                          Tangira ibibazo {quiz.length} <ArrowRight className="size-4" />
                        </>
                      ) : (
                        <>
                          <LoaderCircle className="size-4 animate-spin" /> Turimo kubitegura...
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
              {stage === "quiz" && quiz && (
                <Button onClick={nextQuestion} disabled={busy || !answered}>
                  {index + 1 < quiz.length ? "Ibikurikira" : busy ? "Turimo kubika..." : "Reba uko wakoze"}{" "}
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

function PlacementSummary({
  result,
  answers,
  topicById,
  lessons,
  next,
}: {
  result: PlacementResult;
  answers: Answer[];
  topicById: Map<string, Topic>;
  lessons: Lesson[];
  next: string;
}) {
  const weak = result.weak_topics.map((id) => topicById.get(id)).filter((t): t is Topic => !!t);
  const strong = answers
    .filter((a) => a.selected === a.question.answer)
    .map((a) => topicById.get(a.question.topic))
    .filter((t): t is Topic => !!t);
  const ratio = result.total ? result.correct / result.total : 0;
  const firstLesson = weak.length ? lessonFor(weak[0].id, lessons) : undefined;

  return (
    <div className="space-y-5">
      <div className="card flex flex-col items-center gap-6 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
        <ProgressRing
          value={result.correct}
          max={result.total}
          size={128}
          stroke={11}
          barClassName={ratio >= 0.5 ? "stroke-brand-500" : "stroke-sun-400"}
          label="Ibisubizo by’ukuri"
        >
          <span className="font-display text-3xl font-extrabold">
            {result.correct}/{result.total}
          </span>
        </ProgressRing>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight">
            {ratio >= 0.8 ? "Uhagaze neza cyane!" : ratio >= 0.5 ? "Utangiye neza!" : "Ni intangiriro nziza!"}
          </h1>
          <p className="mt-2 text-muted">
            {weak.length
              ? "Dore ibice ukwiye kwitaho mbere. Ibibazo wibeshyeho bizagaruka no mu isubiramo kugira ngo ubimenye neza."
              : "Wasubije neza mu bice byose. Komeza witoze kugira ngo ugumane uru rwego kugeza ku kizamini."}
          </p>
        </div>
      </div>

      {weak.length > 0 && (
        <section className="card p-5 sm:p-6">
          <h2 className="text-lg font-bold">Ibice ukwiye kwitaho ({weak.length})</h2>
          <ul className="mt-4 divide-y divide-line">
            {weak.map((topic) => {
              const lesson = lessonFor(topic.id, lessons);
              return (
                <li key={topic.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                  <span className="flex flex-1 items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-signal-50 text-signal-600 dark:bg-signal-500/12 dark:text-signal-300">
                      <DynamicIcon name={topic.icon} className="size-5" />
                    </span>
                    <span>
                      <span className="block font-semibold">{topic.name}</span>
                      <span className="hidden text-sm text-muted sm:block">{topic.description}</span>
                    </span>
                  </span>
                  <span className="flex gap-2 sm:shrink-0">
                    {lesson && (
                      <ButtonLink href={`/amasomo/${lesson.slug}`} variant="soft" size="sm">
                        <BookOpen className="size-4" /> Soma isomo
                      </ButtonLink>
                    )}
                    <ButtonLink href={`/imyitozo/kwitoza?topic=${topic.id}&mode=random&count=10`} variant="secondary" size="sm">
                      <Target className="size-4" /> Witoze
                    </ButtonLink>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {strong.length > 0 && (
        <section className="card p-5 sm:p-6">
          <h2 className="text-lg font-bold">Ibyo wasubije neza ({strong.length})</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {strong.map((topic) => (
              <li
                key={topic.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 dark:bg-brand-500/12 dark:text-brand-300"
              >
                <Check className="size-4" aria-hidden /> {topic.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        {firstLesson && (
          <ButtonLink
            href={`/amasomo/${firstLesson.slug}`}
            replace
            size="lg"
            className="h-auto min-h-14 whitespace-normal py-3 text-left leading-snug"
          >
            <BookOpen className="size-5 shrink-0" />
            <span>
              Tangira n’isomo: <span className="font-extrabold">{firstLesson.title}</span>
            </span>
          </ButtonLink>
        )}
        <ButtonLink href={next} replace size="lg" variant={firstLesson ? "secondary" : "primary"}>
          Jya ku kibaho cyanjye <ArrowRight className="size-5" />
        </ButtonLink>
      </div>
    </div>
  );
}
