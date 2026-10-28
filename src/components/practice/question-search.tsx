"use client";

import { LoaderCircle, Search, SearchX, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { QuestionCard } from "@/components/quiz/question-card";
import { api, errorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/format";
import { searchWords } from "@/lib/highlight";
import type { QuestionSearch as SearchResult, Topic } from "@/lib/types";

const SUGGESTIONS = ["umuvuduko ntarengwa", "kunyuranaho", "abanyamaguru", "inkomane", "ihoni", "feri", "uruhushya"];
const DEBOUNCE_MS = 300;

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; query: string; result: SearchResult };

function searchable(query: string): boolean {
  const q = query.trim();
  return q.length >= 2 || /^\d+$/.test(q);
}

/** "Shakisha ikibazo": searches the whole bank as the learner types; the query lives in the URL so it can be shared. */
export function QuestionSearch({ topics, initialQuery, initialTopic }: { topics: Topic[]; initialQuery: string; initialTopic: string | null }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [topic, setTopic] = useState<string | null>(initialTopic);
  const [state, setState] = useState<State>({ kind: "idle" });
  const topicName = (id: string) => topics.find((t) => t.id === id)?.name ?? id;

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (topic) params.set("topic", topic);
    const search = params.toString();
    window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);

    if (!searchable(query)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing results when the box is emptied
      setState({ kind: "idle" });
      return;
    }
    setState((current) => (current.kind === "done" ? current : { kind: "loading" }));
    let live = true;
    const timer = setTimeout(() => {
      const request = new URLSearchParams({ q: query.trim() });
      if (topic) request.set("topic", topic);
      api<SearchResult>(`/questions/search?${request.toString()}`)
        .then((result) => live && setState({ kind: "done", query: query.trim(), result }))
        .catch((e) => live && setState({ kind: "error", message: errorMessage(e) }));
    }, DEBOUNCE_MS);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [query, topic]);

  const words = state.kind === "done" ? searchWords(state.query) : [];

  return (
    <div className="mx-auto max-w-3xl">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <label htmlFor={inputId} className="sr-only">
          Shakisha ikibazo
        </label>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          autoFocus
          autoComplete="off"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Andika ijambo cyangwa nimero y’ikibazo"
          className="h-14 w-full rounded-2xl border border-line bg-surface pl-12 pr-12 text-lg text-ink shadow-soft outline-none transition placeholder:text-muted/80 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/15 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Siba"
            className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label="Ibice">
        {[null, ...topics.map((t) => t.id)].map((id) => (
          <button
            key={id ?? "all"}
            type="button"
            onClick={() => setTopic(id)}
            aria-pressed={topic === id}
            className={cn(
              "h-9 shrink-0 rounded-full border px-3.5 text-sm font-semibold transition",
              topic === id ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-surface text-ink-soft hover:border-brand-300",
            )}
          >
            {id ? topicName(id) : "Ibice byose"}
          </button>
        ))}
      </div>

      <div className="mt-8" aria-live="polite">
        {state.kind === "idle" && (
          <div className="card p-6 text-center sm:p-8">
            <p className="font-semibold">Shakisha mu bibazo byose by’ikizamini</p>
            <p className="mt-1 text-sm text-muted">Mu kibazo, mu bisubizo no mu bisobanuro. Gerageza:</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => setQuery(word)}
                  className="rounded-full bg-brand-50 px-3.5 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}
        {state.kind === "loading" && (
          <p className="flex items-center justify-center gap-2 py-10 text-muted">
            <LoaderCircle className="size-5 animate-spin" aria-hidden /> Turashakisha...
          </p>
        )}
        {state.kind === "error" && <p className="card p-6 text-center text-signal-600">{state.message}</p>}
        {state.kind === "done" && state.result.total === 0 && (
          <div className="card p-8 text-center">
            <SearchX className="mx-auto size-10 text-muted" aria-hidden />
            <p className="mt-3 font-semibold">Nta kibazo kibonetse kuri «{state.query}»</p>
            <p className="mt-1 text-sm text-muted">Gerageza irindi jambo, cyangwa ushakishe mu bice byose.</p>
          </div>
        )}
        {state.kind === "done" && state.result.total > 0 && (
          <>
            <p className="mb-4 text-sm font-semibold text-muted">
              {plural(state.result.total, "ikibazo", "ibibazo")} {state.result.total === 1 ? "kibonetse" : "bibonetse"}
              {state.result.total > state.result.items.length && ` · turerekana ${state.result.items.length} bya mbere`}
            </p>
            <div className="space-y-4">
              {state.result.items.map((q) => (
                <QuestionCard key={q.id} question={q} topicName={topicName(q.topic)} words={words} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
