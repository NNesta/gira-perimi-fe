import { LoaderCircle } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { BadgeCelebration } from "@/components/badges/badge-celebration";
import { ExamResult } from "@/components/exam/exam-result";
import { ExamRunner } from "@/components/exam/exam-runner";
import { learnerFetch, serverFetch } from "@/lib/api-server";
import type { Badges, Challenge, Dashboard, Exam, Topic } from "@/lib/types";

export const metadata: Metadata = { title: "Ikizamini", robots: { index: false } };

async function ExamScreen({ params }: { params: PageProps<"/ikizamini/[id]">["params"] }) {
  const { id } = await params;
  const path = `/ikizamini/${id}`;
  const exam = await learnerFetch<Exam>(`/exams/${encodeURIComponent(id)}`, path);
  if (exam.status === "in_progress") return <ExamRunner key={exam.id} exam={exam} />;
  const [dashboard, topics, badges, challenge] = await Promise.all([
    learnerFetch<Dashboard>("/me/dashboard", path),
    learnerFetch<Topic[]>("/topics", path),
    learnerFetch<Badges>("/me/badges", path),
    // Optional: the comparison with friends on a challenge's paper.
    exam.challenge_code
      ? serverFetch<Challenge>(`/challenges/${encodeURIComponent(exam.challenge_code)}`).catch(() => null)
      : null,
  ]);
  return (
    <>
      <ExamResult exam={exam} readiness={dashboard.readiness} topics={topics} challenge={challenge} />
      <BadgeCelebration uid={dashboard.user.id} badges={badges.items} delayMs={3200} />
    </>
  );
}

export default function ExamPage({ params }: PageProps<"/ikizamini/[id]">) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center">
          <div className="text-center">
            <LoaderCircle className="mx-auto size-10 animate-spin text-brand-500" />
            <p className="mt-4 font-semibold text-muted">Turimo gutegura ikizamini...</p>
          </div>
        </div>
      }
    >
      <ExamScreen params={params} />
    </Suspense>
  );
}
