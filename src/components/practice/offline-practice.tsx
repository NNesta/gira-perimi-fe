"use client";

import { CloudDownload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PracticeSession } from "@/components/practice/practice-session";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { loadPack, readOfflineMeta } from "@/lib/offline";
import type { OfflinePack } from "@/lib/types";

type Saved = { pack: OfflinePack; uid: string } | "missing" | null;

export function OfflinePractice() {
  const params = useSearchParams();
  const [saved, setSaved] = useState<Saved>(null);

  useEffect(() => {
    let cancelled = false;
    void loadPack().then((pack) => {
      const meta = readOfflineMeta();
      if (!cancelled) setSaved(pack && meta ? { pack, uid: meta.uid } : "missing");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (saved === null) {
    return (
      <div className="card mx-auto max-w-3xl space-y-4 p-8" aria-busy="true">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-8 w-4/5" />
        <Skeleton className="h-16" />
      </div>
    );
  }

  if (saved === "missing") {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-ocean-50 text-ocean-600 dark:bg-ocean-500/15 dark:text-ocean-300">
          <CloudDownload className="size-7" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold">Nta myitozo yabitswe kuri iki gikoresho</h1>
        <p className="mt-3 text-muted">
          Igihe ufite interineti, jya ku Myitozo ukande “Bika kuri iki gikoresho”. Nyuma yaho uzajya witoza n’igihe
          nta interineti ufite.
        </p>
        <ButtonLink href="/imyitozo" className="mt-7">
          Jya ku Myitozo
        </ButtonLink>
      </div>
    );
  }

  const topicParam = params.get("topic");
  const topic = saved.pack.topics.some((t) => t.id === topicParam) ? topicParam : null;
  const count = Math.min(50, Math.max(1, Number(params.get("count")) || 10));
  return (
    <PracticeSession
      key={`${topic}-${count}`}
      topic={topic}
      mode="random"
      count={count}
      topics={saved.pack.topics}
      uid={saved.uid}
      pack={saved.pack}
    />
  );
}
