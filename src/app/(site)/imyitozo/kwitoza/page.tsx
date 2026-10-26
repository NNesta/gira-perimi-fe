import type { Metadata } from "next";
import { Suspense } from "react";

import { PracticeSession } from "@/components/practice/practice-session";
import { Skeleton } from "@/components/ui/skeleton";
import { learnerFetch } from "@/lib/api-server";
import type { PracticeMode, Topic } from "@/lib/types";

export const metadata: Metadata = { title: "Kwitoza" };

const MODES: PracticeMode[] = ["random", "new", "mistakes"];

async function Session({ searchParams }: { searchParams: PageProps<"/imyitozo/kwitoza">["searchParams"] }) {
  const params = await searchParams;
  const topic = typeof params.topic === "string" ? params.topic : null;
  const mode = MODES.includes(params.mode as PracticeMode) ? (params.mode as PracticeMode) : "random";
  const count = Math.min(50, Math.max(1, Number(params.count) || 10));
  const topics = await learnerFetch<Topic[]>("/topics", "/imyitozo");
  return (
    <PracticeSession
      key={`${topic}-${mode}-${count}`}
      topic={topics.some((t) => t.id === topic) ? topic : null}
      mode={mode}
      count={count}
      topics={topics}
    />
  );
}

export default function PracticeSessionPage({ searchParams }: PageProps<"/imyitozo/kwitoza">) {
  return (
    <div className="container-page py-8 sm:py-12">
      <Suspense
        fallback={
          <div className="card mx-auto max-w-3xl space-y-4 p-8">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        }
      >
        <Session searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
