import {
  Activity,
  ArrowRight,
  BadgeCheck,
  ChartLine,
  ClipboardCheck,
  GraduationCap,
  Percent,
  Target,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { BarList } from "@/components/charts/bar-list";
import { ChartTable } from "@/components/charts/chart-table";
import { ColumnChart } from "@/components/charts/column-chart";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton";
import { adminFetch } from "@/lib/api-server";
import { formatDay, formatPercent, formatScore, timeAgo } from "@/lib/format";
import type { AdminUserRow, Page, PlatformStats } from "@/lib/types";

import { READINESS_BADGES } from "@/components/admin/readiness-badges";

function Kpi({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string; sub?: string }) {
  return (
    <div className="card p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-muted">
        <Icon className="size-4" /> {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

async function Overview() {
  const [stats, recent] = await Promise.all([
    adminFetch<PlatformStats>("/admin/stats"),
    adminFetch<Page<AdminUserRow>>("/admin/users?sort=joined&order=desc&page_size=6"),
  ]);
  const sumSignups = stats.daily.reduce((s, d) => s + d.signups, 0);
  const sumExams = stats.daily.reduce((s, d) => s + d.exams, 0);
  const topicRows = [...stats.topics].sort((a, b) => (a.accuracy ?? 2) - (b.accuracy ?? 2));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi icon={Users} label="Abanyeshuri bose" value={String(stats.users_total)} sub={`+${stats.users_new_7d} mu minsi 7`} />
        <Kpi icon={Activity} label="Bakoresheje urubuga" value={String(stats.users_active_7d)} sub="Mu minsi 7 ishize" />
        <Kpi icon={BadgeCheck} label="Biteguye ikizamini" value={String(stats.users_ready)} sub="Ibizamini >10, impuzandengo >15" />
        <Kpi icon={ClipboardCheck} label="Ibizamini byakozwe" value={String(stats.exams_total)} sub={`${stats.exams_7d} mu minsi 7`} />
        <Kpi icon={ChartLine} label="Impuzandengo rusange" value={`${formatScore(stats.average_score)}/20`} />
        <Kpi icon={Percent} label="Abatsinze ibizamini" value={formatPercent(stats.pass_rate)} sub="Amanota ≥ 12/20" />
        <Kpi icon={Target} label="Ibisubizo by’imyitozo" value={String(stats.practice_answers)} />
        <Kpi icon={UserPlus} label="Abiyandikishije (iminsi 30)" value={String(sumSignups)} />
      </div>

      <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sun-300 text-asphalt">
          <GraduationCap className="size-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">Ikizamini nyirizina</p>
          <p className="text-sm text-muted">
            {stats.outcomes_answered
              ? `${formatPercent(stats.outcomes_passed / stats.outcomes_answered)} baratsinze · abanyeshuri ${stats.outcomes_answered} batubwiye uko byagenze (${stats.outcomes_passed} baratsinze)`
              : "Nta munyeshuri uratubwira uko ikizamini cye cyagenze. Bazabazwa nyuma y’itariki y’ikizamini cyabo."}
          </p>
        </div>
        <Link
          href="/admin/ubuhamya"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand-600 hover:underline dark:text-brand-300"
        >
          Ubuhamya{stats.testimonials_pending ? ` (${stats.testimonials_pending} butegereje)` : ""} <ArrowRight className="size-4" />
        </Link>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Abiyandikisha buri munsi" subtitle={`Iminsi 30 ishize · ${sumSignups} bose`}>
          <ColumnChart
            label="Abiyandikisha buri munsi mu minsi 30 ishize"
            color="var(--chart-2)"
            data={stats.daily.map((d) => ({ key: d.day, label: formatDay(d.day), value: d.signups, detail: `${formatDay(d.day)} · abiyandikishije` }))}
            labelEvery={7}
          />
          <ChartTable caption="Abiyandikisha buri munsi" columns={["Umunsi", "Abiyandikishije"]} rows={stats.daily.map((d) => [formatDay(d.day), d.signups])} />
        </Panel>
        <Panel title="Ibizamini bikorwa buri munsi" subtitle={`Iminsi 30 ishize · ${sumExams} byose`}>
          <ColumnChart
            label="Ibizamini byakozwe buri munsi mu minsi 30 ishize"
            data={stats.daily.map((d) => ({ key: d.day, label: formatDay(d.day), value: d.exams, detail: `${formatDay(d.day)} · ibizamini` }))}
            labelEvery={7}
          />
          <ChartTable caption="Ibizamini bikorwa buri munsi" columns={["Umunsi", "Ibizamini"]} rows={stats.daily.map((d) => [formatDay(d.day), d.exams])} />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Uko amanota y’ibizamini angana" subtitle="Umubare w’ibizamini kuri buri manota (0–20)">
          <ColumnChart
            label="Umubare w’ibizamini kuri buri manota"
            data={stats.score_distribution.map((b) => ({ key: String(b.score), label: String(b.score), value: b.count, detail: `amanota ${b.score}/20` }))}
            marker={{ index: 12, label: "12 · gutsinda" }}
            labelEvery={2}
          />
          <ChartTable
            caption="Uko amanota y’ibizamini angana"
            columns={["Amanota", "Ibizamini"]}
            rows={stats.score_distribution.map((b) => [`${b.score}/20`, b.count])}
          />
        </Panel>
        <Panel title="Ibice bigora abanyeshuri" subtitle="Ijanisha ry’ibisubizo by’ukuri muri buri gice (ibigoye mbere)">
          <BarList
            label="Ijanisha ry’ukuri muri buri gice"
            rows={topicRows.map((t) => ({
              key: t.topic,
              label: t.name,
              ratio: t.accuracy,
              value: formatPercent(t.accuracy),
              detail: `ibisubizo ${t.answered}`,
            }))}
          />
          <ChartTable
            caption="Ijanisha ry’ukuri muri buri gice"
            columns={["Igice", "Ukuri", "Ibisubizo"]}
            rows={stats.topics.map((t) => [t.name, formatPercent(t.accuracy), t.answered])}
          />
        </Panel>
      </div>

      <Panel title="Abiyandikishije vuba">
        {recent.items.length === 0 ? (
          <p className="text-sm text-muted">Nta munyeshuri uriyandikisha.</p>
        ) : (
          <ul className="divide-y divide-line">
            {recent.items.map((u) => {
              const badge = READINESS_BADGES[u.readiness_status];
              return (
                <li key={u.id}>
                  <Link href={`/admin/abanyeshuri/${u.id}`} className="flex items-center gap-4 py-3 transition hover:text-brand-600">
                    <Avatar name={u.name} src={u.picture_url} size={40} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{u.name}</span>
                      <span className="block truncate text-sm text-muted">{u.email}</span>
                    </span>
                    <span className="hidden text-sm text-muted sm:block" suppressHydrationWarning>
                      {timeAgo(u.created_at)}
                    </span>
                    <Badge tone={badge.tone}>{badge.label}</Badge>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link href="/admin/abanyeshuri" className="mt-4 inline-block text-sm font-bold text-brand-600 hover:underline dark:text-brand-300">
          Reba abanyeshuri bose
        </Link>
      </Panel>
    </div>
  );
}

export default function AdminHomePage() {
  return (
    <div className="px-4 py-8 sm:px-8 lg:py-10">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">Ubuyobozi</p>
        <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Incamake y’urubuga</h1>
        <p className="mt-2 text-muted">Abiyandikishije, uko bakora n’aho bakeneye ubufasha.</p>
      </div>
      <Suspense fallback={<PageSkeleton title={false} cards={8} />}>
        <Overview />
      </Suspense>
    </div>
  );
}
