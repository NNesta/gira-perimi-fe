import type { Metadata } from "next";
import { Suspense } from "react";

import { QuestionSearch } from "@/components/practice/question-search";
import { PageHeader } from "@/components/ui/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { learnerFetch } from "@/lib/api-server";
import type { Topic } from "@/lib/types";

export const metadata: Metadata = { title: "Shakisha ikibazo", robots: { index: false } };

async function Search({ searchParams }: { searchParams: PageProps<"/imyitozo/shakisha">["searchParams"] }) {
  const [params, topics] = await Promise.all([searchParams, learnerFetch<Topic[]>("/topics", "/imyitozo/shakisha")]);
  const q = typeof params.q === "string" ? params.q : "";
  const topic = typeof params.topic === "string" && topics.some((t) => t.id === params.topic) ? params.topic : null;
  return <QuestionSearch topics={topics} initialQuery={q} initialTopic={topic} />;
}

export default function SearchPage({ searchParams }: PageProps<"/imyitozo/shakisha">) {
  return (
    <>
      <PageHeader
        eyebrow="Imyitozo"
        title="Shakisha ikibazo"
        description="Wibuka ikibazo kimwe cyakugoye? Andika ijambo ririmo cyangwa nimero yacyo, urebe igisubizo cy’ukuri n’impamvu yacyo."
      />
      <div className="container-page py-10">
        <Suspense fallback={<Skeleton className="mx-auto h-14 max-w-3xl rounded-2xl" />}>
          <Search searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
