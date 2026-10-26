import type { Metadata } from "next";
import { Suspense } from "react";

import { ReviewRunner } from "@/components/review/review-runner";
import { Skeleton } from "@/components/ui/skeleton";
import { learnerFetch } from "@/lib/api-server";
import type { ReviewSession, Topic, User } from "@/lib/types";

export const metadata: Metadata = {
  title: "Isubiramo",
  description: "Subiramo ibyo wibeshyeho: bigaruka nyuma y’umunsi 1, 3, 7, 14 na 30 kugeza ubimenye neza.",
};

async function Review() {
  const [session, topics, user] = await Promise.all([
    learnerFetch<ReviewSession>("/review", "/isubiramo"),
    learnerFetch<Topic[]>("/topics", "/isubiramo"),
    learnerFetch<User>("/auth/me", "/isubiramo"),
  ]);
  // A new batch (after "Komeza") gets a fresh runner.
  const batch = session.items.map((i) => (i.kind === "question" ? `q${i.question.id}` : `s${i.sign.id}`)).join(",");
  return <ReviewRunner key={batch} session={session} topics={topics} uid={user.id} />;
}

export default function ReviewPage() {
  return (
    <div className="container-page py-8 sm:py-12">
      <Suspense
        fallback={
          <div className="mx-auto max-w-3xl space-y-4">
            <Skeleton className="h-56 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
          </div>
        }
      >
        <Review />
      </Suspense>
    </div>
  );
}
