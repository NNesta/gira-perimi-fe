import { BarList } from "@/components/charts/bar-list";
import { ChartTable } from "@/components/charts/chart-table";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { formatDateTime, formatDayLong, formatDuration, formatPercent, formatScore, timeAgo } from "@/lib/format";
import type { LearnerReport } from "@/lib/types";

/**
 * A learner's progress as staff see it: readiness, scores, topics and recent exams. Shared by the admin area and the
 * instructors of the learner's classes; `facts` adds lines at the top of the details list (admins see more).
 */
export function LearnerProgress({
  learner,
  facts = [],
}: {
  learner: LearnerReport;
  facts?: { label: string; value: string }[];
}) {
  const r = learner.readiness;
  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Ibizamini", value: String(learner.exams.completed), sub: `${learner.exams.passed} yatsinze` },
          { label: "Impuzandengo", value: `${formatScore(learner.exams.average)}/20` },
          { label: "Amanota yo hejuru", value: `${formatScore(learner.exams.best)}/20` },
          { label: "Ibisubizo by’imyitozo", value: String(learner.practice_answers) },
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
              <span>
                Impuzandengo y’ibizamini {r.average_window} biheruka (igomba kurenga {r.average_required})
              </span>
              <span>{formatScore(r.average)}/20</span>
            </div>
            <ProgressBar value={r.average ?? 0} max={20} className="mt-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Amasomo yarangije</span>
              <span>
                {learner.lessons_completed}/{learner.lessons_total}
              </span>
            </div>
            <ProgressBar value={learner.lessons_completed} max={learner.lessons_total} className="mt-2" />
          </div>
          <dl className="grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
            {[
              ...facts,
              { label: "Aheruka gukoresha", value: learner.last_active_at ? timeAgo(learner.last_active_at) : "—" },
              { label: "Abatsinze mu bizamini", value: formatPercent(learner.exams.pass_rate) },
              { label: "Itariki y’ikizamini", value: learner.exam_date ? formatDayLong(learner.exam_date) : "Ntayo" },
              { label: "Intego · iminsi ikurikiranya", value: `Ibibazo ${learner.daily_goal} · ${learner.streak_days}` },
            ].map((fact) => (
              <div key={fact.label}>
                <dt className="text-muted">{fact.label}</dt>
                <dd className="font-semibold">{fact.value}</dd>
              </div>
            ))}
            <div className="col-span-2">
              <dt className="text-muted">Isubiramo</dt>
              <dd className="font-semibold">
                Bigeze igihe {learner.review.due} · biracyigwa {learner.review.learning} · yabimenye{" "}
                {learner.review.mastered}
              </dd>
            </div>
          </dl>
        </section>

        <section className="card p-6">
          <h2 className="text-lg font-bold">Uko akora muri buri gice</h2>
          <p className="mb-5 mt-0.5 text-sm text-muted">Ijanisha ry’ibisubizo by’ukuri</p>
          <BarList
            label="Ijanisha ry’ukuri muri buri gice"
            rows={[...learner.topics]
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
            rows={learner.topics.map((t) => [t.name, formatPercent(t.accuracy), t.answered])}
          />
        </section>
      </div>

      <section className="card overflow-hidden">
        <h2 className="px-6 pt-6 text-lg font-bold">Ibizamini biheruka</h2>
        {learner.recent_exams.length === 0 ? (
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
                {learner.recent_exams.map((e) => (
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
    </>
  );
}
