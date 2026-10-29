import { ArrowLeft, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { READINESS_BADGES } from "@/components/admin/readiness-badges";
import { LearnerProgress } from "@/components/learners/learner-progress";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageSkeleton } from "@/components/ui/skeleton";
import { learnerFetch } from "@/lib/api-server";
import type { LearnerReport } from "@/lib/types";

export const metadata: Metadata = { title: "Umunyeshuri", robots: { index: false } };

async function Learner({ params }: { params: PageProps<"/umwarimu/[classId]/[userId]">["params"] }) {
  const { classId, userId } = await params;
  const learner = await learnerFetch<LearnerReport>(
    `/teaching/classes/${encodeURIComponent(classId)}/learners/${encodeURIComponent(userId)}`,
    `/umwarimu/${classId}/${userId}`,
  );
  const badge = READINESS_BADGES[learner.readiness.status];
  return (
    <div className="space-y-6">
      <section className="card flex items-center gap-5 p-6 sm:p-8">
        <Avatar name={learner.name} src={learner.picture_url} size={84} />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold sm:text-3xl">{learner.name}</h1>
          <p className="mt-1 flex items-center gap-2 truncate text-muted">
            <Mail className="size-4 shrink-0" /> {learner.email}
          </p>
          <div className="mt-3">
            <Badge tone={badge.tone}>{badge.label}</Badge>
          </div>
        </div>
      </section>
      <LearnerProgress learner={learner} />
    </div>
  );
}

/** One learner of the instructor's class: the same progress report admins see, without account details. */
export default function ClassLearnerPage({ params }: PageProps<"/umwarimu/[classId]/[userId]">) {
  return (
    <div className="container-page py-8 sm:py-12">
      <Suspense fallback={<PageSkeleton title={false} cards={4} />}>
        <BackLink params={params} />
        <Learner params={params} />
      </Suspense>
    </div>
  );
}

async function BackLink({ params }: { params: PageProps<"/umwarimu/[classId]/[userId]">["params"] }) {
  const { classId } = await params;
  return (
    <Link href={`/umwarimu/${classId}`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
      <ArrowLeft className="size-4" /> Itsinda
    </Link>
  );
}
