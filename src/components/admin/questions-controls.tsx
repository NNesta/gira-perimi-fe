"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { cn } from "@/lib/cn";
import type { QuestionFilter, Topic } from "@/lib/types";

const STATUSES: { value: QuestionFilter; label: string }[] = [
  { value: "all", label: "Byose" },
  { value: "unreviewed", label: "Bitarasuzumwa" },
  { value: "reviewed", label: "Byasuzumwe" },
  { value: "edited", label: "Byahinduwe" },
  { value: "missing", label: "Nta gisobanuro" },
];

const SORTS = [
  { value: "number", label: "Nomero y’ikibazo" },
  { value: "hardest", label: "Ibikomereye abanyeshuri" },
  { value: "most_answered", label: "Ibisubizwa cyane" },
];

/** Search, topic, review status and sort for the explanations list; state lives in the URL. */
export function QuestionsControls({ topics }: { topics: Topic[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [pending, startTransition] = useTransition();
  const status = (params.get("status") as QuestionFilter | null) ?? "all";

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  useEffect(() => {
    if (query === (params.get("q") ?? "")) return;
    const timer = window.setTimeout(() => update({ q: query.trim() || null }), 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce only on typing
  }, [query]);

  return (
    <div className={cn("space-y-3", pending && "opacity-70")}>
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Shakisha ikibazo</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Shakisha mu kibazo, ibisubizo cyangwa igisobanuro… (cyangwa nomero)"
            className="h-11 w-full rounded-xl border border-line bg-surface pl-11 pr-3 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15"
          />
        </label>
        <div className="flex gap-2">
          <select
            aria-label="Igice"
            value={params.get("topic") ?? ""}
            onChange={(e) => update({ topic: e.target.value || null })}
            className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-sm font-semibold outline-none focus:border-brand-400 lg:w-56 lg:flex-none"
          >
            <option value="">Ibice byose</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Tondeka ukurikije"
            value={params.get("sort") ?? "number"}
            onChange={(e) => update({ sort: e.target.value === "number" ? null : e.target.value })}
            className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 text-sm font-semibold outline-none focus:border-brand-400 lg:w-56 lg:flex-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => update({ status: s.value === "all" ? null : s.value })}
            aria-pressed={status === s.value}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
              status === s.value
                ? "border-asphalt bg-asphalt text-white dark:border-white dark:bg-white dark:text-asphalt"
                : "border-line bg-surface text-ink-soft hover:border-brand-300",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
