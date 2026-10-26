import { ArrowLeft, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { READINESS_BADGES } from "@/components/admin/readiness-badges";
import { UserActions } from "@/components/admin/user-actions";
import { BarList } from "@/components/charts/bar-list";
import { ChartTable } from "@/components/charts/chart-table";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { PageSkeleton } from "@/components/ui/skeleton";
import { adminFetch } from "@/lib/api-server";
import { formatDate, formatDateTime, formatDayLong, formatDuration, formatPercent, formatScore, timeAgo } from "@/lib/format";
import type { AdminUserDetail } from "@/lib/types";

export const metadata: Metadata = { title: "Umunyeshuri" };

async function Detail({ params }: { params: PageProps<"/admin/abanyeshuri/[id]">["params"] }) {
  const { id } = await params;
  const user = await adminFetch<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`);
  const badge = READINESS_BADGES[user.readiness.status];
  const r = user.readiness;

  return (
    <div className="space-y-6">
      <section className="card flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <Avatar name={user.name} src={user.picture_url} size={84} />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold sm:text-3xl">{user.name}</h1>
            <p className="mt-1 flex items-center gap-2 truncate text-muted">
              <Mail className="size-4 shrink-0" /> {user.email}
            </p>
            {user.phone && (
              <p className="mt-0.5 flex items-center gap-2 text-muted">
                <Phone className="size-4" /> {user.phone}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={badge.tone}>{badge.label}</Badge>
              <Badge tone={user.plan === "premium" ? "sun" : "neutral"}>{user.plan === "premium" ? "Ifatabuguzi" : "Ubuntu"}</Badge>
              {!user.is_active && <Badge tone="signal">Konti yahagaritswe</Badge>}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <UserActions userId={user.id} isActive={user.is_active} plan={user.plan} />
          <DeleteUserButton userId={user.id} name={user.name} email={user.email} redirectTo="/admin/abanyeshuri" />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Ibizamini", value: String(user.exams.completed), sub: `${user.exams.passed} yatsinze` },
          { label: "Impuzandengo", value: `${formatScore(user.exams.average)}/20` },
          { label: "Amanota yo hejuru", value: `${formatScore(user.exams.best)}/20` },
          { label: "Ibisubizo by’imyitozo", value: String(user.practice_answers) },
        ].map((k) => (
          <div key={k.label} className="card p-5">
            <p className="text-sm font-semibold text-muted">{k.label}</p>
            <p className="mt-2 text-3xl font-bold">{k.value}</p>
            {k.sub && <p className="mt-1 text-xs text-muted">{k.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <section className="card space-y-5 p-6">
          <h2 className="text-lg font-bold">Imyiteguro y’ikizamini</h2>
          <div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Ibizamini (bigomba kurenga 10)</span>
              <span>
                {r.exams_completed}/{r.exams_required}
              </span>
            </div>
            <ProgressBar value={r.exams_completed} max={r.exams_required} className="mt-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Impuzandengo (igomba kurenga {r.average_required})</span>
              <span>{formatScore(r.average)}/20</span>
            </div>
            <ProgressBar value={r.average ?? 0} max={20} className="mt-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Amasomo yarangije</span>
              <span>
                {user.lessons_completed}/{user.lessons_total}
              </span>
            </div>
            <ProgressBar value={user.lessons_completed} max={user.lessons_total} className="mt-2" />
          </div>
          <dl className="grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
            <div>
              <dt className="text-muted">Yiyandikishije</dt>
              <dd className="font-semibold">{formatDate(user.created_at)}</dd>
            </div>
            <div>
              <dt className="text-muted">Aheruka kwinjira</dt>
              <dd className="font-semibold">{user.last_login_at ? formatDateTime(user.last_login_at) : "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Aheruka gukoresha</dt>
              <dd className="font-semibold">{user.last_active_at ? timeAgo(user.last_active_at) : "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Abatsinze mu bizamini</dt>
              <dd className="font-semibold">{formatPercent(user.exams.pass_rate)}</dd>
            </div>
            <div>
              <dt className="text-muted">Itariki y’ikizamini</dt>
              <dd className="font-semibold">{user.exam_date ? formatDayLong(user.exam_date) : "Ntayo"}</dd>
            </div>
            <div>
              <dt className="text-muted">Intego · iminsi ikurikiranya</dt>
              <dd className="font-semibold">
                Ibibazo {user.daily_goal} · {user.streak_days}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted">Isubiramo</dt>
              <dd className="font-semibold">
                Bigeze igihe {user.review.due} · biracyigwa {user.review.learning} · yabimenye {user.review.mastered}
              </dd>
            </div>
          </dl>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold">Uko akora muri buri gice</h2>
          <p className="mb-5 mt-0.5 text-sm text-muted">Ijanisha ry’ibisubizo by’ukuri</p>
          <BarList
            label="Ijanisha ry’ukuri muri buri gice"
            rows={[...user.topics]
              .sort((a, b) => (a.accuracy ?? 2) - (b.accuracy ?? 2))
              .map((t) => ({
                key: t.topic,
                label: t.name,
                ratio: t.accuracy,
                value: formatPercent(t.accuracy),
                detail: `yasubije ${t.answered} · ukuri ${t.correct}`,
              }))}
          />
          <ChartTable
            caption="Ijanisha ry’ukuri muri buri gice"
            columns={["Igice", "Ukuri", "Yasubije"]}
            rows={user.topics.map((t) => [t.name, formatPercent(t.accuracy), t.answered])}
          />
        </section>
      </div>

      <section className="card overflow-hidden">
        <h2 className="px-6 pt-6 text-lg font-bold">Ibizamini biheruka</h2>
        {user.recent_exams.length === 0 ? (
          <p className="p-6 text-sm text-muted">Ntarakora ikizamini.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left">
              <thead className="bg-surface-2 text-sm text-muted">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">Itariki</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Amanota</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Ibyavuyemo</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Igihe</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {user.recent_exams.map((e) => (
                  <tr key={e.id} className="border-t border-line">
                    <td className="px-6 py-3">{formatDateTime(e.started_at)}</td>
                    <td className="px-6 py-3 font-bold">
                      {e.score ?? "—"}/{e.total}
                    </td>
                    <td className="px-6 py-3">
                      {e.status === "in_progress" ? (
                        <Badge tone="sun">Kirakomeje</Badge>
                      ) : (
                        <Badge tone={e.passed ? "brand" : "signal"}>{e.passed ? "Yatsinze" : "Ntiyatsinze"}</Badge>
                      )}
                    </td>
                    <td className="px-6 py-3 text-muted">{formatDuration(e.duration_seconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminUserPage({ params }: PageProps<"/admin/abanyeshuri/[id]">) {
  return (
    <div className="px-4 py-8 sm:px-8 lg:py-10">
      <Link href="/admin/abanyeshuri" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Abanyeshuri bose
      </Link>
      <Suspense fallback={<PageSkeleton title={false} cards={4} />}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}
