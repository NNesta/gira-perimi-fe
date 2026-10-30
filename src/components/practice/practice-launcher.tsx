"use client";

import { ArrowRight, History, Shuffle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/cn";
import { formatPercent, plural } from "@/lib/format";
import { DynamicIcon, topicTone } from "@/lib/icons";
import type { PracticeMode, Topic, TopicMastery } from "@/lib/types";

const MODES: { id: PracticeMode; label: string; hint: string; icon: typeof Shuffle }[] = [
  { id: "random", label: "Bivanze", hint: "Ibibazo bitoranyijwe ku buryo butunguranye", icon: Shuffle },
  { id: "new", label: "Bishya", hint: "Ibibazo utarasubiza na rimwe", icon: Sparkles },
  { id: "mistakes", label: "Ibyo nibeshyeho", hint: "Ibibazo uheruka gusubiza nabi", icon: History },
];

const COUNTS = [10, 20, 30];

/** Accuracy at a glance: below the 60% pass mark, close to it, or comfortably above (15/20 = 75%). */
function accuracyTone(accuracy: number | null | undefined): string {
  if (accuracy === null || accuracy === undefined) return "text-muted";
  if (accuracy < 0.6) return "text-signal-600 dark:text-signal-400";
  if (accuracy < 0.75) return "text-sun-700 dark:text-sun-300";
  return "text-brand-700 dark:text-brand-300";
}

export function PracticeLauncher({ topics, mastery }: { topics: Topic[]; mastery: TopicMastery[] }) {
  const [mode, setMode] = useState<PracticeMode>("random");
  const [count, setCount] = useState(10);
  const byTopic = new Map(mastery.map((m) => [m.topic, m]));
  const totalQuestions = topics.reduce((sum, t) => sum + t.question_count, 0);

  const href = (topic?: string) => {
    const params = new URLSearchParams({ mode, count: String(count) });
    if (topic) params.set("topic", topic);
    return `/imyitozo/kwitoza?${params.toString()}`;
  };

  return (
    <div className="space-y-10">
      <div className="card grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted">Uburyo bw’imyitozo</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                aria-pressed={mode === item.id}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition",
                  mode === item.id
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-500/15"
                    : "border-line bg-surface hover:border-brand-300",
                )}
              >
                <item.icon className={cn("mt-0.5 size-5 shrink-0", mode === item.id ? "text-brand-600" : "text-muted")} />
                <span>
                  <span className="block font-bold">{item.label}</span>
                  <span className="mt-0.5 block text-sm text-muted">{item.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-muted">Umubare w’ibibazo</p>
          <div className="mt-3 flex gap-2">
            {COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                aria-pressed={count === n}
                className={cn(
                  "h-12 w-16 rounded-2xl border-2 font-display text-lg font-extrabold transition",
                  count === n ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-surface hover:border-brand-300",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Link
        href={href()}
        className="group relative flex flex-col gap-4 overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-500 via-brand-600 to-ocean-600 p-7 text-white shadow-glow transition hover:-translate-y-1 sm:flex-row sm:items-center sm:justify-between sm:p-9"
      >
        <div aria-hidden className="bg-grid absolute inset-0 opacity-15" />
        <div className="relative">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/75">Ibice byose</p>
          <p className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Witoze ibibazo bivuye mu bice byose</p>
          <p className="mt-2 text-white/80">{plural(totalQuestions, "ikibazo", "ibibazo")} by’ikizamini birahari.</p>
        </div>
        <span className="relative inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-2xl bg-white px-6 font-bold text-brand-700 transition group-hover:gap-3 sm:self-auto">
          Tangira <ArrowRight className="size-5" />
        </span>
      </Link>

      <div>
        <h2 className="text-2xl font-extrabold">Hitamo igice</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => {
            const stats = byTopic.get(topic.id);
            const tone = topicTone(topic.id);
            const seenRatio = stats ? stats.seen / Math.max(1, topic.question_count) : 0;
            return (
              <li key={topic.id}>
                <Link
                  href={href(topic.id)}
                  className={cn(
                    "card group relative flex h-full flex-col overflow-hidden bg-gradient-to-br to-transparent p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-6",
                    tone.soft,
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-soft transition group-hover:scale-105",
                        tone.bar,
                      )}
                    >
                      <DynamicIcon name={topic.icon} className="size-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold leading-snug">{topic.name}</h3>
                      <p className="text-xs font-bold text-muted">{plural(topic.question_count, "ikibazo", "ibibazo")}</p>
                    </div>
                    <ArrowRight
                      className="size-5 shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-ink"
                      aria-hidden
                    />
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{topic.description}</p>
                  <div className="mt-4 space-y-2 sm:mt-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted">
                      <span>Ibyo umaze kubona: {stats?.seen ?? 0}</span>
                      <span>
                        Ukuri: <span className={cn("font-bold", accuracyTone(stats?.accuracy))}>{formatPercent(stats?.accuracy)}</span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                      <div className={cn("h-full rounded-full", tone.bar)} style={{ width: `${Math.round(seenRatio * 100)}%` }} />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
