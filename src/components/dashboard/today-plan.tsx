import { ArrowRight, BookOpen, CalendarClock, Check, ClipboardCheck, Flame, Repeat, Target, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { PlanEditButton } from "@/components/plan/plan-edit-button";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/cn";
import { formatDayLong, plural } from "@/lib/format";
import type { Dashboard, LessonSummary } from "@/lib/types";

const PACE: Record<string, { label: string; tone: string }> = {
  on_track: { label: "Uri ku murongo ✓", tone: "bg-white/20 text-white" },
  tight: { label: "Igihe ni gito: ongera imbaraga", tone: "bg-sun-300 text-asphalt" },
  today: { label: "Ni uyu munsi! Amahirwe masa 🍀", tone: "bg-sun-300 text-asphalt" },
  passed: { label: "Itariki yararenze: shyiraho indi", tone: "bg-white/20 text-white" },
};

/** "Kora ikizamini 1 buri minsi 2 n’isomo 1 ku munsi": the rhythm that gets the learner ready by the exam date. */
function rhythm(plan: Dashboard["plan"]): string | null {
  if (plan.days_left === null || plan.days_left <= 0) return null;
  const lessons =
    plan.lessons_left > 0 ? plural(Math.ceil(plan.lessons_left / plan.days_left), "isomo", "amasomo") : null;
  let exams: string | null = null;
  if (plan.exams_per_day) exams = `Kora ${plural(plan.exams_per_day, "ikizamini", "ibizamini")} buri munsi`;
  else if (plan.exam_every_days === 1) exams = "Kora ikizamini 1 buri munsi";
  else if (plan.exam_every_days) exams = `Kora ikizamini 1 buri minsi ${plan.exam_every_days}`;
  if (exams && lessons) return `${exams} n’${lessons} ku munsi.`;
  if (exams) return `${exams}.`;
  if (lessons) return `Wujuje ibizamini bisabwa. Soma ${lessons} ku munsi.`;
  return "Wujuje ibizamini n’amasomo byose. Komeza usubiremo!";
}

function Task({
  icon: Icon,
  title,
  sub,
  done,
  href,
  action,
  children,
}: {
  icon: LucideIcon;
  title: string;
  sub?: string;
  done: boolean;
  href?: string;
  action?: string;
  children?: React.ReactNode;
}) {
  return (
    <li className={cn("flex items-center gap-3.5 rounded-2xl border p-3.5 transition", done ? "border-brand-200/70 bg-brand-50/60 dark:border-brand-400/20 dark:bg-brand-500/10" : "border-line")}>
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          done ? "bg-brand-500 text-white" : "bg-surface-2 text-ink-soft",
        )}
      >
        {done ? <Check className="size-5" aria-label="Byakozwe" /> : <Icon className="size-5" aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block font-semibold leading-snug", done && "text-ink-soft")}>{title}</span>
        {sub && <span className="block text-sm text-muted">{sub}</span>}
        {children}
      </span>
      {href && action && !done && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700 transition hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25"
        >
          {action} <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </li>
  );
}

/** Dashboard card: countdown to the exam date and today's checklist (goal, review, lesson, mock exam). */
export function TodayPlan({
  data,
  nextLesson,
  remindersAvailable,
}: {
  data: Dashboard;
  nextLesson: LessonSummary | undefined;
  remindersAvailable: boolean;
}) {
  const { plan, today, review, user } = data;
  const goalDone = today.answered >= today.goal;
  const pace = PACE[plan.pace];
  const steps = rhythm(plan);

  return (
    <section aria-label="Gahunda y’uyu munsi" className="card overflow-hidden">
      <div className="grid lg:grid-cols-[20rem_1fr]">
        <div className="relative overflow-hidden bg-gradient-to-br from-ocean-600 via-ocean-700 to-brand-700 p-6 text-white sm:p-7">
          <div aria-hidden className="bg-grid absolute inset-0 opacity-15" />
          <div aria-hidden className="absolute -bottom-16 -right-10 size-48 rounded-full bg-sun-300/25 blur-2xl" />
          <div className="relative flex h-full flex-col">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/75">
              <CalendarClock className="size-4" aria-hidden /> Ikizamini cyawe
            </p>
            {plan.exam_date ? (
              <>
                <p className="mt-4 font-display text-6xl font-extrabold leading-none tabular-nums">
                  {Math.max(0, plan.days_left ?? 0)}
                </p>
                <p className="mt-1 font-semibold text-white/85">
                  {plan.days_left === 1 ? "umunsi usigaye" : "iminsi isigaye"} · {formatDayLong(plan.exam_date)}
                </p>
                {pace && <span className={cn("mt-4 self-start rounded-full px-3 py-1 text-xs font-bold", pace.tone)}>{pace.label}</span>}
                {steps && <p className="mt-4 text-sm leading-relaxed text-white/85">{steps}</p>}
                <div className="mt-auto pt-5">
                  <PlanEditButton user={user} remindersAvailable={remindersAvailable} />
                </div>
              </>
            ) : (
              <>
                <p className="mt-4 font-display text-2xl font-extrabold leading-snug">Ikizamini cyawe ni ryari?</p>
                <p className="mt-2 text-sm leading-relaxed text-white/85">
                  Shyiraho itariki, tugutegurire gahunda: iminsi isigaye, ibizamini by’igerageza n’amasomo ya buri munsi.
                </p>
                <div className="mt-auto pt-5">
                  <PlanEditButton user={user} remindersAvailable={remindersAvailable} variant="set" />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Gahunda y’uyu munsi</h2>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold",
                data.streak_days > 0 ? "bg-sun-100 text-sun-800 dark:bg-sun-400/15 dark:text-sun-300" : "bg-surface-2 text-muted",
              )}
            >
              <Flame className="size-4" aria-hidden />
              {data.streak_days > 0 ? `Iminsi ${data.streak_days} ukurikiranya` : "Tangira uruhererekane"}
            </span>
          </div>
          <ul className="mt-4 space-y-2.5">
            <Task
              icon={Target}
              title={goalDone ? `Wageze ku ntego: ibibazo ${today.goal}!` : `Subiza ibibazo ${today.goal}`}
              done={goalDone}
              href="/imyitozo/kwitoza?count=10"
              action="Witoze"
            >
              <span className="mt-2 flex items-center gap-2.5">
                <ProgressBar value={today.answered} max={today.goal} className="h-2" label="Intego y’uyu munsi" />
                <span className="shrink-0 text-xs font-bold tabular-nums text-muted">
                  {Math.min(today.answered, today.goal)}/{today.goal}
                </span>
              </span>
            </Task>
            {(review.due > 0 || review.learning > 0) && (
              <Task
                icon={Repeat}
                title={review.due > 0 ? `Subiramo ${plural(review.due, "ikintu", "ibintu")}` : "Isubiramo ry’uyu munsi ryarangiye"}
                sub={review.due > 0 ? "Ibyo wibeshyeho bigarutse uyu munsi" : undefined}
                done={review.due === 0}
                href="/isubiramo"
                action="Subiramo"
              />
            )}
            {nextLesson ? (
              <Task
                icon={BookOpen}
                title={today.lesson_done ? "Wasomye isomo uyu munsi" : `Soma: ${nextLesson.title}`}
                sub={today.lesson_done ? undefined : `Iminota ${nextLesson.minutes}`}
                done={today.lesson_done}
                href={`/amasomo/${nextLesson.slug}`}
                action="Soma"
              />
            ) : null}
            {(today.exam_suggested || today.exam_done) && (
              <Task
                icon={ClipboardCheck}
                title={today.exam_done ? "Wakoze ikizamini cy’igerageza uyu munsi" : "Kora ikizamini cy’igerageza"}
                sub={today.exam_done ? undefined : "Ibibazo 20 mu minota 20, nk’ikizamini nyirizina"}
                done={today.exam_done}
                href="/ikizamini"
                action="Tangira"
              />
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
