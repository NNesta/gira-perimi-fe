import { ArrowLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { READINESS_BADGES } from "@/components/admin/readiness-badges";
import { BarList } from "@/components/charts/bar-list";
import { ArchiveClassButton, ClassCodeShare, RemoveLearnerButton } from "@/components/teaching/teaching-actions";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton";
import { learnerFetch } from "@/lib/api-server";
import { formatDay, formatPercent, formatScore, timeAgo } from "@/lib/format";
import type { ClassDetail } from "@/lib/types";

export const metadata: Metadata = { title: "Itsinda", robots: { index: false } };

async function ClassView({ params }: { params: PageProps<"/umwarimu/[classId]">["params"] }) {
  const { classId } = await params;
  const path = `/umwarimu/${classId}`;
  const klass = await learnerFetch<ClassDetail>(`/teaching/classes/${encodeURIComponent(classId)}`, path);
  const ready = klass.learners.filter((l) => l.readiness.ready).length;
  const answered = klass.topics.some((t) => t.answered > 0);

  return (
    <div className="space-y-6">
      <section className="card flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-muted">{klass.school_name}</p>
          <h1 className="mt-1 text-3xl font-extrabold">{klass.name}</h1>
          <p className="mt-2 text-muted">
            Abanyeshuri {klass.learners.length} · {ready} biteguye ikizamini nyirizina
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          {klass.archived ? (
            <Badge>Ryabitswe: ntiryakira abanyeshuri bashya</Badge>
          ) : (
            <ClassCodeShare code={klass.join_code} className={klass.name} school={klass.school_name} />
          )}
          <ArchiveClassButton classId={klass.id} archived={klass.archived} />
        </div>
      </section>

      <section className="card overflow-hidden">
        <h2 className="px-6 pt-6 text-lg font-bold">Abanyeshuri</h2>
        {klass.learners.length === 0 ? (
          <p className="p-6 text-muted">Nta munyeshuri urinjira. Bahe kode y’itsinda cyangwa link yaryo.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="bg-surface-2 text-muted">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">Umunyeshuri</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Imyiteguro</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Ibizamini</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">10 biheruka</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Akeneye imbaraga muri</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Aheruka</th>
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">Ibikorwa</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {klass.learners.map((learner) => {
                  const badge = READINESS_BADGES[learner.readiness.status];
                  return (
                    <tr key={learner.id} className="border-t border-line align-top">
                      <td className="px-6 py-3">
                        <Link href={`/umwarimu/${klass.id}/${learner.id}`} className="flex items-center gap-3 hover:text-brand-600">
                          <Avatar name={learner.name} src={learner.picture_url} size={36} />
                          <span className="min-w-0">
                            <span className="block truncate font-semibold">{learner.name}</span>
                            <span className="block truncate text-xs text-muted">
                              {learner.exam_date ? `Ikizamini: ${formatDay(learner.exam_date)}` : learner.email}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{learner.exams_completed}</td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums">
                        {formatScore(learner.readiness.average)}/20
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {learner.weak_topics.length ? learner.weak_topics.join(" · ") : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {learner.last_active_at ? timeAgo(learner.last_active_at) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center justify-end gap-1">
                          <RemoveLearnerButton classId={klass.id} userId={learner.id} name={learner.name} />
                          <Link
                            href={`/umwarimu/${klass.id}/${learner.id}`}
                            aria-label={`Reba aho ${learner.name} ageze`}
                            className="grid size-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-ink"
                          >
                            <ChevronRight className="size-4" />
                          </Link>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {answered && (
        <section className="card p-6">
          <h2 className="text-lg font-bold">Ibice itsinda rikeneye kongeramo imbaraga</h2>
          <p className="mb-5 mt-0.5 text-sm text-muted">Ijanisha ry’ibisubizo by’ukuri by’abanyeshuri bose, ibikomeye mbere</p>
          <BarList
            label="Ijanisha ry’ukuri ry’itsinda muri buri gice"
            rows={klass.topics.map((t) => ({
              key: t.topic,
              label: t.name,
              ratio: t.accuracy,
              value: formatPercent(t.accuracy),
              detail: `ibisubizo ${t.answered}`,
            }))}
          />
        </section>
      )}
    </div>
  );
}

export default function ClassPage({ params }: PageProps<"/umwarimu/[classId]">) {
  return (
    <div className="container-page py-8 sm:py-12">
      <Link href="/umwarimu" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Amatsinda yanjye
      </Link>
      <Suspense fallback={<PageSkeleton title={false} cards={3} />}>
        <ClassView params={params} />
      </Suspense>
    </div>
  );
}
