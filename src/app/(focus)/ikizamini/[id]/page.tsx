import { LoaderCircle } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { ExamResult } from "@/components/exam/exam-result";
import { ExamRunner } from "@/components/exam/exam-runner";
import { learnerFetch } from "@/lib/api-server";
import type { Dashboard, Exam, Topic } from "@/lib/types";

export const metadata: Metadata = { title: "Ikizamini", robots: { index: false } };

async function ExamScreen({ params }: { params: PageProps<"/ikizamini/[id]">["params"] }) {
  const { id } = await params;
  const path = `/ikizamini/${id}`;
  const exam = await learnerFetch<Exam>(`/exams/${encodeURIComponent(id)}`, path);
  if (exam.status === "in_progress") return <ExamRunner key={exam.id} exam={exam} />;
  const [dashboard, topics] = await Promise.all([
    learnerFetch<Dashboard>("/me/dashboard", path),
    learnerFetch<Topic[]>("/topics", path),
  ]);
  return <ExamResult exam={exam} readiness={dashboard.readiness} topics={topics} />;
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
