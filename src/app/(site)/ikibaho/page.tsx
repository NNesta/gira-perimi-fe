import {
  ArrowRight,
  BookOpen,
  ChartLine,
  ClipboardCheck,
  Play,
  Repeat,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { BarList } from "@/components/charts/bar-list";
import { ChartTable } from "@/components/charts/chart-table";
import { ColumnChart } from "@/components/charts/column-chart";
import { LineTrendChart } from "@/components/charts/line-trend-chart";
import { ReadinessCard } from "@/components/dashboard/readiness-card";
import { TodayPlan } from "@/components/dashboard/today-plan";
import { ExamStartButton } from "@/components/exam/exam-start-button";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress";
import { PageSkeleton } from "@/components/ui/skeleton";
import { learnerFetch, serverFetch } from "@/lib/api-server";
import { firstName, formatDate, formatDay, formatPercent, formatScore, formatShortDate, greeting, plural, weekdayShort } from "@/lib/format";
import type { AuthConfig, Dashboard, LessonSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Ikibaho cyanjye" };

function StatTile({
  icon: Icon,
  label,
  value,
  sub,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="flex items-center gap-2 text-sm font-semibold text-muted">
        <Icon className="size-4" /> {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      {body}
    </Link>
  ) : (
    <div className="card p-5">{body}</div>
  );
}

function Panel({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

async function DashboardContent() {
  const [data, lessons, config] = await Promise.all([
    learnerFetch<Dashboard>("/me/dashboard", "/ikibaho"),
    learnerFetch<LessonSummary[]>("/lessons", "/ikibaho"),
    serverFetch<AuthConfig>("/auth/config").catch(() => null),
  ]);
  const { user, readiness, exams, trend, topics } = data;
  const nextLesson = lessons.find((l) => l.slug === data.lessons.next_slug);
  const topicRows = [...topics].sort((a, b) => (a.accuracy ?? 2) - (b.accuracy ?? 2));

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-muted">{formatDate(new Date())}</p>
          <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">
            {greeting()}, {firstName(user.name, user.given_name)}! 👋
          </h1>
        </div>
        <ExamStartButton signedIn resumeId={data.in_progress_exam} size="md" />
      </div>

      {data.in_progress_exam && (
        <Link
          href={`/ikizamini/${data.in_progress_exam}`}
          className="mt-6 flex items-center gap-4 rounded-3xl border border-sun-300 bg-sun-50 p-5 transition hover:shadow-soft dark:border-sun-300/30 dark:bg-sun-400/10"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sun-300 text-asphalt">
            <Play className="size-5" />
          </span>
          <span className="flex-1">
            <span className="block font-bold">Ufite ikizamini kitarangiye</span>
            <span className="text-sm text-muted">Gikomeze mbere y’uko igihe cyacyo kirangira.</span>
          </span>
          <ArrowRight className="size-5" />
        </Link>
      )}

      <div className="mt-8">
        <TodayPlan data={data} nextLesson={nextLesson} remindersAvailable={!!config?.reminders_available} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        <ReadinessCard user={user} readiness={readiness} />
        <div className="grid grid-cols-2 gap-4">
          <StatTile icon={ClipboardCheck} label="Ibizamini wakoze" value={String(exams.completed)} sub={`${exams.passed} watsinze`} />
          <StatTile icon={ChartLine} label="Impuzandengo" value={`${formatScore(exams.average)}/20`} sub="Ku bizamini byose" />
          <StatTile icon={Trophy} label="Amanota yo hejuru" value={`${formatScore(exams.best)}/20`} sub={exams.last !== null ? `Aheruka: ${exams.last}/20` : undefined} />
          <StatTile
            icon={Repeat}
            label="Isubiramo"
            value={String(data.review.due)}
            sub={
              data.review.learning + data.review.mastered > 0
                ? `Biracyigwa ${data.review.learning} · wabimenye ${data.review.mastered}`
                : "Ibyo wibeshyeho bizagaruka hano"
            }
            href="/isubiramo"
          />
          <div className="card col-span-2 flex items-center gap-5 p-5">
            <ProgressRing value={data.lessons.completed} max={data.lessons.total} size={76} stroke={8} label="Amasomo warangije">
              <span className="text-sm font-bold">
                {data.lessons.completed}/{data.lessons.total}
              </span>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-muted">
                <BookOpen className="size-4" /> Amasomo
              </p>
              {nextLesson ? (
                <Link href={`/amasomo/${nextLesson.slug}`} className="mt-1 block truncate font-bold hover:text-brand-600">
                  Rikurikira: {nextLesson.title}
                </Link>
              ) : (
                <p className="mt-1 font-bold">Warangije amasomo yose! 🎓</p>
              )}
              <p className="text-xs text-muted">
                Wabonye ibibazo {data.questions_seen}/{data.question_total} by’ikizamini
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Amanota y’ibizamini"
          subtitle={trend.length ? `Ibizamini ${trend.length} biheruka, kuri 20` : "Nta kizamini urakora"}
        >
          {trend.length > 0 ? (
            <>
              <LineTrendChart
                label="Amanota y’ibizamini biheruka"
                points={trend.map((p, i) => ({
                  key: p.exam_id,
                  label: formatShortDate(p.date),
                  value: p.score,
                  detail: `Ikizamini cya ${data.exams.completed - trend.length + i + 1} · ${formatShortDate(p.date)} · ${p.passed ? "Yatsinze" : "Ntiyatsinze"}`,
                }))}
                yMax={20}
                ticks={[0, 5, 10, 15, 20]}
                thresholds={[
                  { value: 12, label: "12" },
                  { value: 15, label: "15" },
                ]}
                valueSuffix="/20"
              />
              <p className="mt-2 text-xs text-muted">Imirongo y’uduce: 12 = amanota yo gutsinda · 15 = impuzandengo y’imyiteguro</p>
              <ChartTable
                caption="Amanota y’ibizamini"
                columns={["Itariki", "Amanota", "Ibyavuyemo"]}
                rows={trend.map((p) => [formatDate(p.date), `${p.score}/20`, p.passed ? "Yatsinze" : "Ntiyatsinze"])}
              />
            </>
          ) : (
            <div className="grid place-items-center rounded-2xl bg-surface-2 px-6 py-12 text-center">
              <Target className="size-10 text-muted" />
              <p className="mt-3 font-bold">Kora ikizamini cya mbere</p>
              <p className="mt-1 max-w-sm text-sm text-muted">Amanota yawe azagaragara hano, ku buryo ubona uko utera imbere.</p>
              <div className="mt-5">
                <ExamStartButton signedIn size="md" />
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Ibikorwa by’iminsi 14" subtitle={`Ibisubizo watanze: ${data.practice_answers} mu myitozo`}>
          <ColumnChart
            label="Ibisubizo watanze buri munsi mu minsi 14 ishize"
            data={data.activity.map((d) => ({
              key: d.day,
              label: weekdayShort(d.day),
              value: d.answers,
              detail: `${formatDay(d.day)} · ${plural(d.answers, "igisubizo", "ibisubizo")}`,
            }))}
            labelEvery={2}
          />
          <ChartTable
            caption="Ibikorwa by’iminsi 14"
            columns={["Umunsi", "Ibisubizo"]}
            rows={data.activity.map((d) => [formatDay(d.day), d.answers])}
          />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Aho ukomeye n’aho ukeneye imbaraga"
          subtitle="Ijanisha ry’ibisubizo by’ukuri muri buri gice (imyitozo n’ibizamini)"
          action={
            <ButtonLink href="/imyitozo" variant="soft" size="sm">
              Imyitozo
            </ButtonLink>
          }
        >
          <BarList
            label="Ijanisha ry’ukuri muri buri gice"
            rows={topicRows.map((t) => ({
              key: t.topic,
              label: t.name,
              ratio: t.accuracy,
              value: formatPercent(t.accuracy),
              detail:
                t.answered > 0
                  ? `Wasubije ${t.answered} · ukuri ${t.correct} · ibibazo wabonye ${t.seen}/${t.question_count}`
                  : `Nta kibazo urasubiza · ibibazo ${t.question_count}`,
              action: (
                <Link
                  href={`/imyitozo/kwitoza?topic=${t.topic}&count=10`}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-brand-600 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
                >
                  Witoze
                </Link>
              ),
            }))}
          />
          <ChartTable
            caption="Ijanisha ry’ukuri muri buri gice"
            columns={["Igice", "Ukuri", "Wasubije", "Ibisubizo by’ukuri"]}
            rows={topics.map((t) => [t.name, formatPercent(t.accuracy), t.answered, t.correct])}
          />
        </Panel>

        <Panel
          title="Ibizamini biheruka"
          action={
            <Link href="/ibizamini" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">
              Byose
            </Link>
          }
        >
          {data.recent_exams.length > 0 ? (
            <ul className="divide-y divide-line">
              {data.recent_exams.map((exam) => (
                <li key={exam.id}>
                  <Link href={`/ikizamini/${exam.id}`} className="flex items-center gap-4 py-3 transition hover:text-brand-600">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-2 font-display text-lg font-extrabold">
                      {exam.score}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{formatDate(exam.started_at)}</span>
                      <span className="text-sm text-muted">{exam.score}/{exam.total}</span>
                    </span>
                    <Badge tone={exam.passed ? "brand" : "signal"}>{exam.passed ? "Yatsinze" : "Ntiyatsinze"}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl bg-surface-2 p-6 text-center text-sm text-muted">Ibizamini ukora bizagaragara hano.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
