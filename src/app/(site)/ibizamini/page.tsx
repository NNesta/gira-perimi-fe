import { ArrowRight, ClipboardList } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ExamStartButton } from "@/components/exam/exam-start-button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { learnerFetch } from "@/lib/api-server";
import { formatDateTime, formatDuration } from "@/lib/format";
import type { ExamSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Ibizamini nakoze" };

async function History() {
  const exams = await learnerFetch<ExamSummary[]>("/exams?limit=200", "/ibizamini");
  if (exams.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-surface-2 text-muted">
          <ClipboardList className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold">Nta kizamini urakora</h2>
        <p className="mt-2 text-muted">Ikizamini cy’igerageza gifata iminota 20. Gerageza ubu urebe aho ugeze.</p>
        <div className="mt-6 flex justify-center">
          <ExamStartButton signedIn />
        </div>
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left">
          <thead className="bg-surface-2 text-sm text-muted">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Itariki</th>
              <th scope="col" className="px-5 py-3 font-semibold">Amanota</th>
              <th scope="col" className="px-5 py-3 font-semibold">Ibyavuyemo</th>
              <th scope="col" className="px-5 py-3 font-semibold">Igihe cyakoreshejwe</th>
              <th scope="col" className="px-5 py-3">
                <span className="sr-only">Reba</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam.id} className="border-t border-line transition hover:bg-surface-2/60">
                <td className="px-5 py-4 font-medium">{formatDateTime(exam.started_at)}</td>
                <td className="px-5 py-4 font-display text-lg font-extrabold tabular-nums">
                  {exam.score ?? "—"}
                  <span className="text-sm text-muted">/{exam.total}</span>
                </td>
                <td className="px-5 py-4">
                  {exam.status === "in_progress" ? (
                    <Badge tone="sun">Kirakomeje</Badge>
                  ) : (
                    <Badge tone={exam.passed ? "brand" : "signal"}>{exam.passed ? "Yatsinze" : "Ntiyatsinze"}</Badge>
                  )}
                </td>
                <td className="px-5 py-4 tabular-nums text-muted">{formatDuration(exam.duration_seconds)}</td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/ikizamini/${exam.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:underline dark:text-brand-300">
                    {exam.status === "in_progress" ? "Komeza" : "Reba"} <ArrowRight className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ExamHistoryPage() {
  return (
    <>
      <PageHeader eyebrow="Amateka" title="Ibizamini nakoze" description="Ibizamini byose by’igerageza wakoze, amanota yabyo n’isubiramo ry’ibibazo." />
      <div className="container-page py-10">
        <Suspense fallback={<Skeleton className="h-96 rounded-3xl" />}>
          <History />
        </Suspense>
      </div>
    </>
  );
}
